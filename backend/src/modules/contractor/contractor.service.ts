import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor } from './entities/contractor.entity';
import { Worker } from './entities/worker.entity';
import { Category } from '../master-data/entities/category.entity';
import { CreateContractorProfileDto } from './dto/create-contractor-profile.dto';
import { UpdateContractorProfileDto } from './dto/update-contractor-profile.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class ContractorService {
  private readonly logger = new Logger(ContractorService.name);

  constructor(
    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ─── PUBLIC METHODS ───────────────────────────────────────────────

  async createProfile(
    userId: string,
    dto: CreateContractorProfileDto,
  ): Promise<ServiceResult<Contractor>> {
    try {
      const existing = await this._findByUserId(userId);
      if (existing.data) {
        throw new ConflictException('Contractor profile already exists');
      }

      const categories = dto.categoryIds
        ? await this.categoryRepository.findByIds(dto.categoryIds)
        : [];

      const contractor = this.contractorRepository.create({
        ownerUserId: userId,
        companyName: dto.companyName,
        bio: dto.bio ?? null,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        serviceAreas: dto.serviceAreas ?? [],
        availabilityStatus: dto.availabilityStatus,
        workforceSizeMin: dto.workforceSizeMin ?? null,
        workforceSizeMax: dto.workforceSizeMax ?? null,
        categories,
      });

      const saved = await this.contractorRepository.save(contractor);

      this.logger.log(
        JSON.stringify({
          action: 'CONTRACTOR_PROFILE_CREATED',
          contractorId: saved.id,
          userId,
        }),
      );

      return { success: true, message: 'Profile created', data: saved };
    } catch (error: unknown) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(
        'createProfile failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getMyProfile(userId: string): Promise<ServiceResult<Contractor>> {
    try {
      const result = await this._findByUserId(userId);
      if (!result.data) {
        throw new NotFoundException('Contractor profile not found');
      }
      return { success: true, message: 'Profile fetched', data: result.data };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'getMyProfile failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    dto: UpdateContractorProfileDto,
  ): Promise<ServiceResult<Contractor>> {
    try {
      const result = await this._findByUserId(userId);
      if (!result.data) {
        throw new NotFoundException('Contractor profile not found');
      }

      const contractor = result.data;

      if (dto.categoryIds) {
        contractor.categories = await this.categoryRepository.findByIds(
          dto.categoryIds,
        );
      }

      const updated = await this.contractorRepository.save({
        ...contractor,
        ...dto,
        categories: contractor.categories,
      });

      this.logger.log(
        JSON.stringify({
          action: 'CONTRACTOR_PROFILE_UPDATED',
          contractorId: contractor.id,
        }),
      );

      return { success: true, message: 'Profile updated', data: updated };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'updateProfile failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getContractorById(id: string): Promise<ServiceResult<Contractor>> {
    try {
      const result = await this._findById(id);
      if (!result.data) {
        throw new NotFoundException('Contractor not found');
      }
      return { success: true, message: 'Contractor fetched', data: result.data };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'getContractorById failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async addWorker(
    userId: string,
    dto: CreateWorkerDto,
  ): Promise<ServiceResult<Worker>> {
    try {
      const contractorResult = await this._findByUserId(userId);
      if (!contractorResult.data) {
        throw new NotFoundException('Contractor profile not found');
      }

      const worker = this.workerRepository.create({
        contractorId: contractorResult.data.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
        trade: dto.trade,
      });

      const saved = await this.workerRepository.save(worker);

      this.logger.log(
        JSON.stringify({
          action: 'WORKER_ADDED',
          workerId: saved.id,
          contractorId: contractorResult.data.id,
        }),
      );

      return { success: true, message: 'Worker added', data: saved };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'addWorker failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getMyWorkers(userId: string): Promise<ServiceResult<Worker[]>> {
    try {
      const contractorResult = await this._findByUserId(userId);
      if (!contractorResult.data) {
        throw new NotFoundException('Contractor profile not found');
      }

      const workers = await this.workerRepository.find({
        where: {
          contractorId: contractorResult.data.id,
          isActive: true,
        },
      });

      return { success: true, message: 'Workers fetched', data: workers };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'getMyWorkers failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async removeWorker(
    userId: string,
    workerId: string,
  ): Promise<ServiceResult<null>> {
    try {
      const contractorResult = await this._findByUserId(userId);
      if (!contractorResult.data) {
        throw new NotFoundException('Contractor profile not found');
      }

      const worker = await this.workerRepository.findOne({
        where: { id: workerId, contractorId: contractorResult.data.id },
      });

      if (!worker) {
        throw new NotFoundException('Worker not found');
      }

      await this.workerRepository.softDelete(workerId);

      return { success: true, message: 'Worker removed', data: null };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'removeWorker failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getContractorByUserId(userId: string): Promise<ServiceResult<Contractor>> {
    return this._findByUserId(userId);
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private async _findByUserId(
    userId: string,
  ): Promise<ServiceResult<Contractor>> {
    try {
      const contractor = await this.contractorRepository.findOne({
        where: { ownerUserId: userId },
        relations: ['categories'],
      });
      return {
        success: true,
        message: 'Query complete',
        data: contractor ?? null,
      };
    } catch (error: unknown) {
      this.logger.warn('_findByUserId failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private async _findById(id: string): Promise<ServiceResult<Contractor>> {
    try {
      const contractor = await this.contractorRepository.findOne({
        where: { id },
        relations: ['categories'],
      });
      return {
        success: true,
        message: 'Query complete',
        data: contractor ?? null,
      };
    } catch (error: unknown) {
      this.logger.warn('_findById failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }
}
