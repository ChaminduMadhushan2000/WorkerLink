import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost, JobPostStatus } from './entities/job-post.entity';
import { JobPostStatusHistory } from './entities/job-post-status-history.entity';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { FilterJobPostsDto } from './dto/filter-job-posts.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

const VALID_TRANSITIONS: Partial<Record<JobPostStatus, JobPostStatus[]>> = {
  [JobPostStatus.DRAFT]: [JobPostStatus.OPEN, JobPostStatus.CANCELLED],
  [JobPostStatus.OPEN]: [
    JobPostStatus.NEGOTIATION,
    JobPostStatus.CANCELLED,
    JobPostStatus.DRAFT,
  ],
  [JobPostStatus.NEGOTIATION]: [
    JobPostStatus.PRICE_LOCKED,
    JobPostStatus.OPEN,
    JobPostStatus.CANCELLED,
  ],
  [JobPostStatus.PRICE_LOCKED]: [
    JobPostStatus.ACTIVE,
    JobPostStatus.CANCELLED,
    JobPostStatus.DISPUTED,
  ],
  [JobPostStatus.ACTIVE]: [
    JobPostStatus.COMPLETED,
    JobPostStatus.CANCELLED,
    JobPostStatus.DISPUTED,
  ],
};

@Injectable()
export class JobPostsService {
  private readonly logger = new Logger(JobPostsService.name);

  constructor(
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
    @InjectRepository(JobPostStatusHistory)
    private readonly statusHistoryRepository: Repository<JobPostStatusHistory>,
  ) {}

  // ─── PUBLIC METHODS ───────────────────────────────────────────────

  async createJobPost(
    customerId: string,
    dto: CreateJobPostDto,
  ): Promise<ServiceResult<JobPost>> {
    try {
      const jobPost = this.jobPostRepository.create({
        customerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        district: dto.district,
        city: dto.city,
        addressText: dto.addressText ?? null,
        preferredStartDateFrom: dto.preferredStartDateFrom
          ? new Date(dto.preferredStartDateFrom)
          : null,
        preferredStartDateTo: dto.preferredStartDateTo
          ? new Date(dto.preferredStartDateTo)
          : null,
        materialsNote: dto.materialsNote ?? null,
        photos: [],
        status: JobPostStatus.OPEN,
      });

      const saved = await this.jobPostRepository.save(jobPost);

      await this._recordStatusChange(
        saved.id,
        JobPostStatus.DRAFT,
        JobPostStatus.OPEN,
        customerId,
        'Job post created',
      );

      this.logger.log(
        JSON.stringify({
          action: 'JOB_POST_CREATED',
          jobPostId: saved.id,
          customerId,
        }),
      );

      return { success: true, message: 'Job post created', data: saved };
    } catch (error: unknown) {
      this.logger.error(
        'createJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getJobPosts(
    filters: FilterJobPostsDto,
  ): Promise<ServiceResult<{ posts: JobPost[]; total: number }>> {
    try {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 25;
      const skip = (page - 1) * limit;

      const query = this.jobPostRepository
        .createQueryBuilder('jp')
        .leftJoinAndSelect('jp.category', 'category')
        .where('jp.deleted_at IS NULL');

      if (filters.categoryId) {
        query.andWhere('jp.category_id = :categoryId', {
          categoryId: filters.categoryId,
        });
      }

      if (filters.district) {
        query.andWhere('jp.district = :district', {
          district: filters.district,
        });
      }

      if (filters.city) {
        query.andWhere('jp.city = :city', { city: filters.city });
      }

      if (filters.status) {
        query.andWhere('jp.status = :status', { status: filters.status });
      } else {
        query.andWhere('jp.status = :status', { status: JobPostStatus.OPEN });
      }

      query.orderBy('jp.created_at', 'DESC').skip(skip).take(limit);

      const [posts, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Job posts fetched',
        data: { posts, total },
      };
    } catch (error: unknown) {
      this.logger.error(
        'getJobPosts failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getJobPostById(id: string): Promise<ServiceResult<JobPost>> {
    try {
      const result = await this._findById(id);
      if (!result.data) {
        throw new NotFoundException('Job post not found');
      }
      return { success: true, message: 'Job post fetched', data: result.data };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'getJobPostById failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getMyJobPosts(customerId: string): Promise<ServiceResult<JobPost[]>> {
    try {
      const posts = await this.jobPostRepository.find({
        where: { customerId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });
      return { success: true, message: 'Job posts fetched', data: posts };
    } catch (error: unknown) {
      this.logger.error(
        'getMyJobPosts failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async updateJobPost(
    customerId: string,
    jobPostId: string,
    dto: UpdateJobPostDto,
  ): Promise<ServiceResult<JobPost>> {
    try {
      const result = await this._findById(jobPostId);
      if (!result.data) {
        throw new NotFoundException('Job post not found');
      }

      const jobPost = result.data;

      if (jobPost.customerId !== customerId) {
        throw new ForbiddenException('You do not own this job post');
      }

      const editableStatuses = [JobPostStatus.DRAFT, JobPostStatus.OPEN];
      if (!editableStatuses.includes(jobPost.status)) {
        throw new BadRequestException(
          'Job post cannot be edited in its current status',
        );
      }

      const updated = await this.jobPostRepository.save({
        ...jobPost,
        ...dto,
      });

      return { success: true, message: 'Job post updated', data: updated };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        'updateJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async closeJobPost(
    customerId: string,
    jobPostId: string,
  ): Promise<ServiceResult<JobPost>> {
    try {
      return this.transitionStatus(
        jobPostId,
        JobPostStatus.CANCELLED,
        customerId,
        'Closed by customer',
      );
    } catch (error: unknown) {
      this.logger.error(
        'closeJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async transitionStatus(
    jobPostId: string,
    toStatus: JobPostStatus,
    changedByUserId: string,
    reason?: string,
  ): Promise<ServiceResult<JobPost>> {
    try {
      const result = await this._findById(jobPostId);
      if (!result.data) {
        throw new NotFoundException('Job post not found');
      }

      const jobPost = result.data;
      const validNext = VALID_TRANSITIONS[jobPost.status] ?? [];

      if (!validNext.includes(toStatus)) {
        throw new BadRequestException(
          `Cannot transition from ${jobPost.status} to ${toStatus}`,
        );
      }

      const fromStatus = jobPost.status;
      jobPost.status = toStatus;
      const updated = await this.jobPostRepository.save(jobPost);

      await this._recordStatusChange(
        jobPostId,
        fromStatus,
        toStatus,
        changedByUserId,
        reason ?? null,
      );

      this.logger.log(
        JSON.stringify({
          action: 'JOB_POST_STATUS_CHANGED',
          jobPostId,
          fromStatus,
          toStatus,
        }),
      );

      return { success: true, message: 'Status updated', data: updated };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        'transitionStatus failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private async _findById(id: string): Promise<ServiceResult<JobPost>> {
    try {
      const jobPost = await this.jobPostRepository.findOne({
        where: { id },
        relations: ['category'],
      });
      return {
        success: true,
        message: 'Query complete',
        data: jobPost ?? null,
      };
    } catch (error: unknown) {
      this.logger.warn('_findById failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private async _recordStatusChange(
    jobPostId: string,
    fromStatus: JobPostStatus,
    toStatus: JobPostStatus,
    changedByUserId: string,
    reason: string | null,
  ): Promise<ServiceResult<null>> {
    try {
      const record = this.statusHistoryRepository.create({
        jobPostId,
        fromStatus,
        toStatus,
        changedByUserId,
        reason,
      });
      await this.statusHistoryRepository.save(record);
      return { success: true, message: 'Status recorded', data: null };
    } catch (error: unknown) {
      this.logger.warn('_recordStatusChange failed', error);
      return { success: false, message: 'Record failed', data: null };
    }
  }
}
