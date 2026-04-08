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
import { MasterDataService } from './master-data.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { Category } from './entities/category.entity';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  // Public — anyone can fetch categories
  @Get('categories')
  async getAllCategories(): Promise<ServiceResult<Category[]>> {
    return this.masterDataService.getAllCategories();
  }

  // Admin only — create category
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(
    @Body() dto: CreateCategoryDto,
  ): Promise<ServiceResult<Category>> {
    return this.masterDataService.createCategory(dto);
  }

  // Admin only — update category
  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ServiceResult<Category>> {
    return this.masterDataService.updateCategory(id, dto);
  }

  // Admin only — delete category
  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(@Param('id') id: string): Promise<ServiceResult<null>> {
    return this.masterDataService.deleteCategory(id);
  }
}
