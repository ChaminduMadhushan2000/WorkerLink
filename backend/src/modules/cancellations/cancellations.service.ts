import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CancellationLedger,
  CancellationEventType,
} from './entities/cancellation-ledger.entity';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { Contractor } from '../contractor/entities/contractor.entity';
import { User, UserStatus } from '../auth/entities/user.entity';
import { JobPostsService } from '../job-posts/job-posts.service';
import { JobPostStatus } from '../job-posts/entities/job-post.entity';
import { RequestCancellationDto } from './dto/request-cancellation.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

const FREE_CANCELLATIONS_PER_WEEK = 2;

@Injectable()
export class CancellationsService {
  private readonly logger = new Logger(CancellationsService.name);

  constructor(
    @InjectRepository(CancellationLedger)
    private readonly ledgerRepository: Repository<CancellationLedger>,
    @InjectRepository(AdminAuditLog)
    private readonly auditLogRepository: Repository<AdminAuditLog>,
    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jobPostsService: JobPostsService,
  ) {}

  async requestCancellation(
    userId: string,
    dto: RequestCancellationDto,
  ): Promise<ServiceResult<null>> {
    try {
      const contractor = await this.contractorRepository.findOne({
        where: { ownerUserId: userId },
      });

      if (!contractor) {
        throw new NotFoundException('Contractor profile not found');
      }

      const weekKey = this._getCurrentWeekKey();
      const count = await this._countCancellationsThisWeek(
        contractor.id,
        weekKey,
      );

      // Write attempt to ledger first (append-only)
      await this._writeLedger(
        contractor.id,
        dto.jobPostId,
        weekKey,
        CancellationEventType.CANCEL_ATTEMPT,
        dto.reason,
      );

      if (count >= FREE_CANCELLATIONS_PER_WEEK) {
        // Policy violated — block contractor
        await this._writeLedger(
          contractor.id,
          dto.jobPostId,
          weekKey,
          CancellationEventType.CANCEL_BLOCKED,
          'Cancellation limit exceeded',
        );

        // Pause the contractor account
        await this.userRepository.update(userId, {
          status: UserStatus.PAUSED,
        });

        this.logger.warn(
          JSON.stringify({
            action: 'CONTRACTOR_BLOCKED_CANCELLATION',
            contractorId: contractor.id,
            weekKey,
          }),
        );

        throw new ForbiddenException(
          'Cancellation limit exceeded. Your account has been paused. Please contact admin.',
        );
      }

      // Allowed — cancel the job post
      await this._writeLedger(
        contractor.id,
        dto.jobPostId,
        weekKey,
        CancellationEventType.CANCEL_ALLOWED,
        dto.reason,
      );

      await this.jobPostsService.transitionStatus(
        dto.jobPostId,
        JobPostStatus.CANCELLED,
        userId,
        dto.reason,
      );

      this.logger.log(
        JSON.stringify({
          action: 'CANCELLATION_ALLOWED',
          contractorId: contractor.id,
          jobPostId: dto.jobPostId,
        }),
      );

      return { success: true, message: 'Cancellation processed', data: null };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        'requestCancellation failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async adminUnblockContractor(
    adminId: string,
    contractorId: string,
    reason: string,
  ): Promise<ServiceResult<null>> {
    try {
      const contractor = await this.contractorRepository.findOne({
        where: { id: contractorId },
        relations: ['owner'],
      });

      if (!contractor) {
        throw new NotFoundException('Contractor not found');
      }

      // Unblock the user
      await this.userRepository.update(contractor.ownerUserId, {
        status: UserStatus.ACTIVE,
      });

      // Write append-only audit log
      const auditLog = this.auditLogRepository.create({
        actorAdminId: adminId,
        subjectContractorId: contractorId,
        action: 'unblock_contractor',
        metadata: { reason },
      });
      await this.auditLogRepository.save(auditLog);

      this.logger.log(
        JSON.stringify({
          action: 'CONTRACTOR_UNBLOCKED',
          contractorId,
          adminId,
          reason,
        }),
      );

      return { success: true, message: 'Contractor unblocked', data: null };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'adminUnblockContractor failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getCancellationCountForContractor(
    contractorId: string,
    weekKey?: string,
  ): Promise<ServiceResult<number>> {
    try {
      const week = weekKey ?? this._getCurrentWeekKey();
      const count = await this._countCancellationsThisWeek(contractorId, week);
      return { success: true, message: 'Count fetched', data: count };
    } catch (error: unknown) {
      this.logger.error(
        'getCancellationCountForContractor failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private _getCurrentWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 +
        startOfYear.getDay() +
        1) /
        7,
    );
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  private async _countCancellationsThisWeek(
    contractorId: string,
    weekKey: string,
  ): Promise<number> {
    return this.ledgerRepository.count({
      where: {
        contractorId,
        weekKey,
        type: CancellationEventType.CANCEL_ALLOWED,
      },
    });
  }

  private async _writeLedger(
    contractorId: string,
    jobPostId: string,
    weekKey: string,
    type: CancellationEventType,
    reason: string | null,
  ): Promise<ServiceResult<null>> {
    try {
      const record = this.ledgerRepository.create({
        contractorId,
        jobPostId,
        weekKey,
        type,
        reason,
      });
      await this.ledgerRepository.save(record);
      return { success: true, message: 'Ledger written', data: null };
    } catch (error: unknown) {
      this.logger.warn('_writeLedger failed', error);
      return { success: false, message: 'Ledger write failed', data: null };
    }
  }
}
