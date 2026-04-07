import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type {
  ServiceResult,
  LoginResult,
  RegisterResult,
} from '../../common/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ServiceResult<RegisterResult>> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceResult<LoginResult>> {
    const result = await this.authService.login(dto);

    if (result.success && result.data) {
      // Store refresh token in HttpOnly cookie — never in response body
      res.cookie('refresh_token', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      });

      // Remove refresh token from response body
      const { refreshToken: _, ...safeData } = result.data;
      void _;
      return { ...result, data: safeData as LoginResult };
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async refresh(
    @Req() req: Request,
  ): Promise<ServiceResult<{ accessToken: string; refreshToken: string }>> {
    const user = req.user as { id: string };
    return this.authService.refreshTokens(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): ServiceResult<null> {
    res.clearCookie('refresh_token');
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  }
}
