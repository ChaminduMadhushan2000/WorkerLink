import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('status')
  getStatus(): ServiceResult<unknown> {
    return this.platformService.getStatus();
  }

  @Get('app-version')
  getAppVersion(@Query('platform') platform: string): ServiceResult<unknown> {
    return this.platformService.getAppVersion(platform);
  }

  @Post('maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setMaintenanceMode(
    @Body() body: { enabled: boolean; message?: string },
  ): ServiceResult<null> {
    return this.platformService.setMaintenanceMode(
      body.enabled,
      body.message ?? null,
    );
  }
}
