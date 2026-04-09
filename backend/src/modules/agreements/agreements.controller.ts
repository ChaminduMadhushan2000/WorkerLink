import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { ProposeAgreementDto } from './dto/propose-agreement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { Agreement } from './entities/agreement.entity';

@Controller('agreements')
@UseGuards(JwtAuthGuard)
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post('propose')
  async proposeAgreement(
    @CurrentUser() user: User,
    @Body() dto: ProposeAgreementDto,
  ): Promise<ServiceResult<Agreement>> {
    return this.agreementsService.proposeAgreement(user.id, dto);
  }

  @Post(':id/accept')
  async acceptAgreement(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ServiceResult<Agreement>> {
    return this.agreementsService.acceptAgreement(user.id, id);
  }

  @Get('job-posts/:jobPostId')
  async getAgreementForJobPost(
    @Param('jobPostId') jobPostId: string,
  ): Promise<ServiceResult<Agreement>> {
    return this.agreementsService.getAgreementForJobPost(jobPostId);
  }
}
