import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ContractorService } from './contractor.service';
import { CreateContractorProfileDto } from './dto/create-contractor-profile.dto';
import { UpdateContractorProfileDto } from './dto/update-contractor-profile.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { Contractor } from './entities/contractor.entity';
import { Worker } from './entities/worker.entity';

@Controller('contractors')
@UseGuards(JwtAuthGuard)
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  @Post('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async createProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateContractorProfileDto,
  ): Promise<ServiceResult<Contractor>> {
    return this.contractorService.createProfile(user.id, dto);
  }

  @Get('profile/me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async getMyProfile(
    @CurrentUser() user: User,
  ): Promise<ServiceResult<Contractor>> {
    return this.contractorService.getMyProfile(user.id);
  }

  @Patch('profile/me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateContractorProfileDto,
  ): Promise<ServiceResult<Contractor>> {
    return this.contractorService.updateProfile(user.id, dto);
  }

  @Get(':id')
  async getContractorById(
    @Param('id') id: string,
  ): Promise<ServiceResult<Contractor>> {
    return this.contractorService.getContractorById(id);
  }

  @Post('workers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async addWorker(
    @CurrentUser() user: User,
    @Body() dto: CreateWorkerDto,
  ): Promise<ServiceResult<Worker>> {
    return this.contractorService.addWorker(user.id, dto);
  }

  @Get('workers/me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async getMyWorkers(
    @CurrentUser() user: User,
  ): Promise<ServiceResult<Worker[]>> {
    return this.contractorService.getMyWorkers(user.id);
  }

  @Delete('workers/:workerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  async removeWorker(
    @CurrentUser() user: User,
    @Param('workerId') workerId: string,
  ): Promise<ServiceResult<null>> {
    return this.contractorService.removeWorker(user.id, workerId);
  }
}
