import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement, AgreementStatus } from './entities/agreement.entity';
import { AgreementOverride } from './entities/agreement-override.entity';
import { JobPost, JobPostStatus } from '../job-posts/entities/job-post.entity';
import { ProposeAgreementDto } from './dto/propose-agreement.dto';
import { JobPostsService } from '../job-posts/job-posts.service';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class AgreementsService {
  private readonly logger = new Logger(AgreementsService.name);

  constructor(
    @InjectRepository(Agreement)
    private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementOverride)
    private readonly overrideRepository: Repository<AgreementOverride>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
    private readonly jobPostsService: JobPostsService,
  ) {}

  async proposeAgreement(
    proposedByUserId: string,
    dto: ProposeAgreementDto,
  ): Promise<ServiceResult<Agreement>> {
    try {
      const jobPost = await this.jobPostRepository.findOne({
        where: { id: dto.jobPostId },
      });

      if (!jobPost) {
        throw new NotFoundException('Job post not found');
      }

      const validStatuses = [JobPostStatus.OPEN, JobPostStatus.NEGOTIATION];
      if (!validStatuses.includes(jobPost.status)) {
        throw new BadRequestException(
          'Job post is not in a state that allows agreement proposals',
        );
      }

      const agreement = this.agreementRepository.create({
        jobPostId: dto.jobPostId,
        contractorId: dto.contractorId,
        proposedByUserId,
        finalLaborPriceLkrCents: dto.finalLaborPriceLkrCents,
        estimatedDays: dto.estimatedDays ?? null,
        terms: dto.terms ?? null,
        status: AgreementStatus.PROPOSED,
      });

      const saved = await this.agreementRepository.save(agreement);

      // Transition job post to negotiation
      await this.jobPostsService.transitionStatus(
        dto.jobPostId,
        JobPostStatus.NEGOTIATION,
        proposedByUserId,
        'Agreement proposed',
      );

      this.logger.log(
        JSON.stringify({
          action: 'AGREEMENT_PROPOSED',
          agreementId: saved.id,
          jobPostId: dto.jobPostId,
          priceLkrCents: dto.finalLaborPriceLkrCents,
        }),
      );

      return { success: true, message: 'Agreement proposed', data: saved };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        'proposeAgreement failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async acceptAgreement(
    userId: string,
    agreementId: string,
  ): Promise<ServiceResult<Agreement>> {
    try {
      const agreement = await this.agreementRepository.findOne({
        where: { id: agreementId },
        relations: ['jobPost'],
      });

      if (!agreement) {
        throw new NotFoundException('Agreement not found');
      }

      if (agreement.status !== AgreementStatus.PROPOSED) {
        throw new BadRequestException('Agreement is not in proposed state');
      }

      if (agreement.proposedByUserId === userId) {
        throw new ForbiddenException(
          'You cannot accept your own agreement proposal',
        );
      }

      agreement.status = AgreementStatus.ACCEPTED;
      agreement.acceptedByUserId = userId;
      agreement.acceptedAt = new Date();
      const updated = await this.agreementRepository.save(agreement);

      // Lock the job post — price is now immutable
      await this.jobPostsService.transitionStatus(
        agreement.jobPostId,
        JobPostStatus.PRICE_LOCKED,
        userId,
        'Agreement accepted — price locked',
      );

      this.logger.log(
        JSON.stringify({
          action: 'AGREEMENT_ACCEPTED',
          agreementId,
          jobPostId: agreement.jobPostId,
          finalPriceLkrCents: agreement.finalLaborPriceLkrCents,
        }),
      );

      return {
        success: true,
        message: 'Agreement accepted — price locked',
        data: updated,
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.logger.error(
        'acceptAgreement failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async adminOverride(
    adminId: string,
    agreementId: string,
    reason: string,
    changes: Record<string, unknown>,
  ): Promise<ServiceResult<Agreement>> {
    try {
      const agreement = await this.agreementRepository.findOne({
        where: { id: agreementId },
      });

      if (!agreement) {
        throw new NotFoundException('Agreement not found');
      }

      // Write append-only audit record FIRST
      const override = this.overrideRepository.create({
        agreementId,
        adminId,
        reason,
        changesMade: changes,
      });
      await this.overrideRepository.save(override);

      // Apply changes
      const updated = await this.agreementRepository.save({
        ...agreement,
        ...changes,
      });

      this.logger.log(
        JSON.stringify({
          action: 'AGREEMENT_ADMIN_OVERRIDE',
          agreementId,
          adminId,
          reason,
        }),
      );

      return {
        success: true,
        message: 'Agreement overridden by admin',
        data: updated,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'adminOverride failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getAgreementForJobPost(
    jobPostId: string,
  ): Promise<ServiceResult<Agreement>> {
    try {
      const agreement = await this.agreementRepository.findOne({
        where: { jobPostId, status: AgreementStatus.ACCEPTED },
      });
      return {
        success: true,
        message: 'Query complete',
        data: agreement ?? null,
      };
    } catch (error: unknown) {
      this.logger.error(
        'getAgreementForJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
