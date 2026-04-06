import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ServiceResult,
  RegisterResult,
  LoginResult,
  SafeUser,
} from '../../common/interfaces/api-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── PUBLIC METHODS ───────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<ServiceResult<RegisterResult>> {
    try {
      const existingEmail = await this._findByEmail(dto.email);
      if (existingEmail.data) {
        throw new ConflictException('Email already registered');
      }

      const existingPhone = await this._findByPhone(dto.phone);
      if (existingPhone.data) {
        throw new ConflictException('Phone number already registered');
      }

      const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

      const user = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role as UserRole,
        status: UserStatus.ACTIVE,
      });

      const savedUser = await this.userRepository.save(user);

      this.logger.log(
        JSON.stringify({
          action: 'USER_REGISTERED',
          userId: savedUser.id,
          role: savedUser.role,
        }),
      );

      return {
        success: true,
        message: 'Registration successful',
        data: { user: this._sanitizeUser(savedUser) },
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(
        'register failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<ServiceResult<LoginResult>> {
    try {
      const userResult = await this._findByEmail(dto.email);
      if (!userResult.data) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = userResult.data;

      const lockResult = this._checkAccountLock(user);
      if (!lockResult.success) {
        throw new ForbiddenException(lockResult.message);
      }

      if (user.status === UserStatus.PAUSED) {
        throw new ForbiddenException(
          'Your account has been paused. Please contact support.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        await this._recordFailedAttempt(user);
        throw new UnauthorizedException('Invalid credentials');
      }

      await this._resetFailedAttempts(user);

      const accessToken = this._generateAccessToken(user);
      const refreshToken = await this._generateRefreshToken(user);

      this.logger.log(
        JSON.stringify({
          action: 'USER_LOGIN',
          userId: user.id,
          role: user.role,
        }),
      );

      return {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: this._sanitizeUser(user),
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.logger.error(
        'login failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async refreshTokens(
    userId: string,
  ): Promise<ServiceResult<{ accessToken: string; refreshToken: string }>> {
    try {
      const userResult = await this._findById(userId);
      if (!userResult.data) {
        throw new UnauthorizedException('User not found');
      }

      const user = userResult.data;

      if (user.status === UserStatus.PAUSED) {
        throw new ForbiddenException('Account is paused');
      }

      const accessToken = this._generateAccessToken(user);
      const refreshToken = await this._generateRefreshToken(user);

      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: { accessToken, refreshToken },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.logger.error(
        'refreshTokens failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private async _findByEmail(email: string): Promise<ServiceResult<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return { success: true, message: 'Query complete', data: user ?? null };
    } catch (error) {
      this.logger.warn('_findByEmail failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private async _findByPhone(phone: string): Promise<ServiceResult<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { phone } });
      return { success: true, message: 'Query complete', data: user ?? null };
    } catch (error) {
      this.logger.warn('_findByPhone failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private async _findById(id: string): Promise<ServiceResult<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return { success: true, message: 'Query complete', data: user ?? null };
    } catch (error) {
      this.logger.warn('_findById failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private _checkAccountLock(user: User): ServiceResult<null> {
    try {
      if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
        const minutesLeft = Math.ceil(
          (new Date(user.lockedUntil).getTime() - Date.now()) / 60000,
        );
        return {
          success: false,
          message: `Account locked. Try again in ${minutesLeft} minute(s).`,
          data: null,
        };
      }
      return { success: true, message: 'Account not locked', data: null };
    } catch (error) {
      this.logger.warn('_checkAccountLock failed', error);
      return { success: false, message: 'Lock check failed', data: null };
    }
  }

  private async _recordFailedAttempt(user: User): Promise<ServiceResult<null>> {
    try {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(
          Date.now() + this.LOCKOUT_MINUTES * 60 * 1000,
        );
        this.logger.warn(
          JSON.stringify({ action: 'ACCOUNT_LOCKED', userId: user.id }),
        );
      }
      await this.userRepository.save(user);
      return { success: true, message: 'Attempt recorded', data: null };
    } catch (error) {
      this.logger.warn('_recordFailedAttempt failed', error);
      return {
        success: false,
        message: 'Failed to record attempt',
        data: null,
      };
    }
  }

  private async _resetFailedAttempts(user: User): Promise<ServiceResult<null>> {
    try {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
      return { success: true, message: 'Attempts reset', data: null };
    } catch (error) {
      this.logger.warn('_resetFailedAttempts failed', error);
      return {
        success: false,
        message: 'Failed to reset attempts',
        data: null,
      };
    }
  }

  private _generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, role: user.role, email: user.email },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private async _generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  private _sanitizeUser(user: User): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
