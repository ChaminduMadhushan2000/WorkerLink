import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteVisit } from './entities/site-visit.entity';
import { Contractor } from '../contractor/entities/contractor.entity';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';
import { UpdateSiteVisitDto } from './dto/update-site-visit.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class SiteVisitsService {
  private readonly logger = new Logger(SiteVisitsService.name);

  constructor(
    @InjectRepository(SiteVisit)
    private readonly siteVisitRepository: Repository<SiteVisit>,
    @InjectRepository(Contractor)
    private readonly contractorRepository: Repository<Contractor>,
  ) {}

  async scheduleSiteVisit(
    userId: string,
    dto: CreateSiteVisitDto,
  ): Promise<ServiceResult<SiteVisit>> {
    try {
      const contractor = await this.contractorRepository.findOne({
        where: { ownerUserId: userId },
      });

      if (!contractor) {
        throw new NotFoundException('Contractor profile not found');
      }

      const siteVisit = this.siteVisitRepository.create({
        jobPostId: dto.jobPostId,
        contractorId: contractor.id,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes ?? null,
      });

      const saved = await this.siteVisitRepository.save(siteVisit);

      this.logger.log(
        JSON.stringify({
          action: 'SITE_VISIT_SCHEDULED',
          siteVisitId: saved.id,
          jobPostId: dto.jobPostId,
          contractorId: contractor.id,
        }),
      );

      return { success: true, message: 'Site visit scheduled', data: saved };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'scheduleSiteVisit failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async updateSiteVisit(
    userId: string,
    siteVisitId: string,
    dto: UpdateSiteVisitDto,
  ): Promise<ServiceResult<SiteVisit>> {
    try {
      const siteVisit = await this.siteVisitRepository.findOne({
        where: { id: siteVisitId },
        relations: ['contractor'],
      });

      if (!siteVisit) {
        throw new NotFoundException('Site visit not found');
      }

      if (siteVisit.contractor.ownerUserId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      const updated = await this.siteVisitRepository.save({
        ...siteVisit,
        ...dto,
      });

      this.logger.log(
        JSON.stringify({
          action: 'SITE_VISIT_UPDATED',
          siteVisitId,
          status: dto.status,
        }),
      );

      return { success: true, message: 'Site visit updated', data: updated };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.logger.error(
        'updateSiteVisit failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getSiteVisitsForJobPost(
    jobPostId: string,
  ): Promise<ServiceResult<SiteVisit[]>> {
    try {
      const siteVisits = await this.siteVisitRepository.find({
        where: { jobPostId },
        order: { scheduledAt: 'ASC' },
      });
      return {
        success: true,
        message: 'Site visits fetched',
        data: siteVisits,
      };
    } catch (error: unknown) {
      this.logger.error(
        'getSiteVisitsForJobPost failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
