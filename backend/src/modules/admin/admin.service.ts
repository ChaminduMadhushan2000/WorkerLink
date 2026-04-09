import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Contractor } from '../contractor/entities/contractor.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { CancellationLedger } from '../cancellations/entities/cancellation-ledger.entity';
import { AdminAuditLog } from '../cancellations/entities/admin-audit-log.entity';
import { JobPostsService } from '../job-posts/job-posts.service';
import { JobPostStatus } from '../job-posts/entities/job-post.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
    @InjectRepository(CancellationLedger)
    private readonly ledgerRepository: Repository<CancellationLedger>,
    @InjectRepository(AdminAuditLog)
    private readonly auditLogRepository: Repository<AdminAuditLog>,
    private readonly jobPostsService: JobPostsService,
  ) {}

  async searchUsers(query: string): Promise<ServiceResult<User[]>> {
    try {
      const users = await this.userRepository.find({
        where: [
          { email: Like(`%${query}%`) },
          { firstName: Like(`%${query}%`) },
          { lastName: Like(`%${query}%`) },
        ],
        take: 50,
      });
      return { success: true, message: 'Users found', data: users };
    } catch (error: unknown) {
      this.logger.error(
        'searchUsers failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getAuditLogs(): Promise<ServiceResult<AdminAuditLog[]>> {
    try {
      const logs = await this.auditLogRepository.find({
        order: { occurredAt: 'DESC' },
        take: 200,
      });
      return { success: true, message: 'Audit logs fetched', data: logs };
    } catch (error: unknown) {
      this.logger.error(
        'getAuditLogs failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getCancellationStats(
    contractorId: string,
    weekKey: string,
  ): Promise<ServiceResult<CancellationLedger[]>> {
    try {
      const records = await this.ledgerRepository.find({
        where: { contractorId, weekKey },
        order: { occurredAt: 'DESC' },
      });
      return { success: true, message: 'Stats fetched', data: records };
    } catch (error: unknown) {
      this.logger.error(
        'getCancellationStats failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async overrideJobState(
    adminId: string,
    jobPostId: string,
    toStatus: JobPostStatus,
    reason: string,
  ): Promise<ServiceResult<JobPost>> {
    try {
      const result = await this.jobPostsService.transitionStatus(
        jobPostId,
        toStatus,
        adminId,
        reason,
      );

      // Write audit log
      const log = this.auditLogRepository.create({
        actorAdminId: adminId,
        subjectContractorId: null,
        action: 'override_job_state',
        metadata: { jobPostId, toStatus, reason },
      });
      await this.auditLogRepository.save(log);

      return result;
    } catch (error: unknown) {
      this.logger.error(
        'overrideJobState failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
