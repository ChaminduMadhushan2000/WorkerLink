import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CancellationsService } from './cancellations.service';
import { RequestCancellationDto } from './dto/request-cancellation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Controller('cancellations')
@UseGuards(JwtAuthGuard)
export class CancellationsController {
  constructor(private readonly cancellationsService: CancellationsService) {}

  @Post('request')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async requestCancellation(
    @CurrentUser() user: User,
    @Body() dto: RequestCancellationDto,
  ): Promise<ServiceResult<null>> {
    return this.cancellationsService.requestCancellation(user.id, dto);
  }

  @Post('admin/unblock/:contractorId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUnblockContractor(
    @CurrentUser() user: User,
    @Param('contractorId') contractorId: string,
    @Body() body: { reason: string },
  ): Promise<ServiceResult<null>> {
    return this.cancellationsService.adminUnblockContractor(
      user.id,
      contractorId,
      body.reason,
    );
  }
}
