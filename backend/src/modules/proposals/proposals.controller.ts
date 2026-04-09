import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { Proposal } from './entities/proposal.entity';

@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  // Contractor submits proposal
  @Post('job-posts/:jobPostId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async submitProposal(
    @CurrentUser() user: User,
    @Param('jobPostId') jobPostId: string,
    @Body() dto: CreateProposalDto,
  ): Promise<ServiceResult<Proposal>> {
    return this.proposalsService.submitProposal(user.id, jobPostId, dto);
  }

  // Customer views proposals on their post
  @Get('job-posts/:jobPostId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getProposalsForJobPost(
    @CurrentUser() user: User,
    @Param('jobPostId') jobPostId: string,
  ): Promise<ServiceResult<Proposal[]>> {
    return this.proposalsService.getProposalsForJobPost(user.id, jobPostId);
  }

  // Customer shortlists or rejects a proposal
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async updateProposalStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProposalStatusDto,
  ): Promise<ServiceResult<Proposal>> {
    return this.proposalsService.updateProposalStatus(user.id, id, dto);
  }

  // Contractor views their own proposals
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async getMyProposals(
    @CurrentUser() user: User,
  ): Promise<ServiceResult<Proposal[]>> {
    return this.proposalsService.getMyProposals(user.id);
  }
}
