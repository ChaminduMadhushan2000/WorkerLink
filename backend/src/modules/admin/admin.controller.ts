import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { JobPostStatus } from '../job-posts/entities/job-post.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/search')
  async searchUsers(
    @Query('q') query: string,
  ): Promise<ServiceResult<User[]>> {
    return this.adminService.searchUsers(query);
  }

  @Get('audit-logs')
  async getAuditLogs(): Promise<ServiceResult<unknown[]>> {
    return this.adminService.getAuditLogs();
  }

  @Get('cancellations/:contractorId')
  async getCancellationStats(
    @Param('contractorId') contractorId: string,
    @Query('weekKey') weekKey: string,
  ): Promise<ServiceResult<unknown[]>> {
    return this.adminService.getCancellationStats(contractorId, weekKey);
  }

  @Post('job-posts/:id/override-status')
  async overrideJobState(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { toStatus: JobPostStatus; reason: string },
  ): Promise<ServiceResult<unknown>> {
    return this.adminService.overrideJobState(
      user.id,
      id,
      body.toStatus,
      body.reason,
    );
  }
}
