import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';
import { UpdateSiteVisitDto } from './dto/update-site-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { SiteVisit } from './entities/site-visit.entity';

@Controller('site-visits')
@UseGuards(JwtAuthGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async scheduleSiteVisit(
    @CurrentUser() user: User,
    @Body() dto: CreateSiteVisitDto,
  ): Promise<ServiceResult<SiteVisit>> {
    return this.siteVisitsService.scheduleSiteVisit(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async updateSiteVisit(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSiteVisitDto,
  ): Promise<ServiceResult<SiteVisit>> {
    return this.siteVisitsService.updateSiteVisit(user.id, id, dto);
  }

  @Get('job-posts/:jobPostId')
  async getSiteVisitsForJobPost(
    @Param('jobPostId') jobPostId: string,
  ): Promise<ServiceResult<SiteVisit[]>> {
    return this.siteVisitsService.getSiteVisitsForJobPost(jobPostId);
  }
}
