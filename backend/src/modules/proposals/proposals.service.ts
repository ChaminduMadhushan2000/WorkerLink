import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { JobPost, JobPostStatus } from '../job-posts/entities/job-post.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
  ) {}

  // ─── PUBLIC METHODS ───────────────────────────────────────────────

  async submitProposal(
    contractorId: string,
    jobPostId: string,
    dto: CreateProposalDto,
  ): Promise<ServiceResult<Proposal>> {
    try {
      const jobPost = await this.jobPostRepository.findOne({
        where: { id: jobPostId },
      });

      if (!jobPost) {
        throw new NotFoundException('Job post not found');
      }

      if (
        jobPost.status !== JobPostStatus.OPEN &&
        jobPost.status !== JobPostStatus.NEGOTIATION
      ) {
        throw new BadRequestException('Job post is not accepting proposals');
      }

      const existingProposal = await this._findByContractorAndJobPost(
        contractorId,
        jobPostId,
      );

      if (existingProposal.data) {
        throw new ConflictException(
          'You have already submitted a proposal for this job post',
        );
      }

      const proposal = this.proposalRepository.create({
        jobPostId,
        contractorId,
        priceFormat: dto.priceFormat,
        proposalPriceLkrCents: dto.proposalPriceLkrCents,
        estimatedDays: dto.estimatedDays ?? null,
        note: dto.note ?? null,
        siteVisitRequested: dto.siteVisitRequested ?? false,
      });

      const saved = await this.proposalRepository.save(proposal);

      this.logger.log(
        JSON.stringify({
          action: 'PROPOSAL_SUBMITTED',
          proposalId: saved.id,
          contractorId,
          jobPostId,
          priceLkrCents: saved.proposalPriceLkrCents,
        }),
      );

      return { success: true, message: 'Proposal submitted', data: saved };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      this.logger.error(
        'submitProposal failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getProposalsForJobPost(
    customerId: string,
    jobPostId: string,
  ): Promise<ServiceResult<Proposal[]>> {
    try {
      const jobPost = await this.jobPostRepository.findOne({
        where: { id: jobPostId },
      });

      if (!jobPost) {
        throw new NotFoundException('Job post not found');
      }

      if (jobPost.customerId !== customerId) {
        throw new ForbiddenException('Access denied');
      }

      const proposals = await this.proposalRepository.find({
        where: { jobPostId },
        relations: ['contractor'],
        order: { createdAt: 'DESC' },
      });

      return { success: true, message: 'Proposals fetched', data: proposals };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.logger.error(
        'getProposalsForJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async updateProposalStatus(
    customerId: string,
    proposalId: string,
    dto: UpdateProposalStatusDto,
  ): Promise<ServiceResult<Proposal>> {
    try {
      const proposal = await this.proposalRepository.findOne({
        where: { id: proposalId },
        relations: ['jobPost'],
      });

      if (!proposal) {
        throw new NotFoundException('Proposal not found');
      }

      if (proposal.jobPost.customerId !== customerId) {
        throw new ForbiddenException('Access denied');
      }

      const allowedStatuses = [
        ProposalStatus.SHORTLISTED,
        ProposalStatus.REJECTED,
      ];
      if (!allowedStatuses.includes(dto.status)) {
        throw new BadRequestException('Invalid status transition');
      }

      proposal.status = dto.status;
      const updated = await this.proposalRepository.save(proposal);

      this.logger.log(
        JSON.stringify({
          action: 'PROPOSAL_STATUS_UPDATED',
          proposalId,
          status: dto.status,
        }),
      );

      return {
        success: true,
        message: 'Proposal status updated',
        data: updated,
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        'updateProposalStatus failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getMyProposals(
    contractorId: string,
  ): Promise<ServiceResult<Proposal[]>> {
    try {
      const proposals = await this.proposalRepository.find({
        where: { contractorId },
        relations: ['jobPost'],
        order: { createdAt: 'DESC' },
      });
      return { success: true, message: 'Proposals fetched', data: proposals };
    } catch (error: unknown) {
      this.logger.error(
        'getMyProposals failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private async _findByContractorAndJobPost(
    contractorId: string,
    jobPostId: string,
  ): Promise<ServiceResult<Proposal>> {
    try {
      const proposal = await this.proposalRepository.findOne({
        where: { contractorId, jobPostId },
      });
      return {
        success: true,
        message: 'Query complete',
        data: proposal ?? null,
      };
    } catch (error: unknown) {
      this.logger.warn('_findByContractorAndJobPost failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }
}
