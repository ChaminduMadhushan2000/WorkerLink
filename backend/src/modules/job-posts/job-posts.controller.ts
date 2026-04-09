import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { FilterJobPostsDto } from './dto/filter-job-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { JobPost } from './entities/job-post.entity';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  // Public — contractors browse open posts
  @Get()
  async getJobPosts(
    @Query() filters: FilterJobPostsDto,
  ): Promise<ServiceResult<{ posts: JobPost[]; total: number }>> {
    return this.jobPostsService.getJobPosts(filters);
  }

  // Public — view single post
  @Get(':id')
  async getJobPostById(
    @Param('id') id: string,
  ): Promise<ServiceResult<JobPost>> {
    return this.jobPostsService.getJobPostById(id);
  }

  // Customer — create post
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async createJobPost(
    @CurrentUser() user: User,
    @Body() dto: CreateJobPostDto,
  ): Promise<ServiceResult<JobPost>> {
    return this.jobPostsService.createJobPost(user.id, dto);
  }

  // Customer — get own posts
  @Get('my/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getMyJobPosts(
    @CurrentUser() user: User,
  ): Promise<ServiceResult<JobPost[]>> {
    return this.jobPostsService.getMyJobPosts(user.id);
  }

  // Customer — edit post
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async updateJobPost(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateJobPostDto,
  ): Promise<ServiceResult<JobPost>> {
    return this.jobPostsService.updateJobPost(user.id, id, dto);
  }

  // Customer — close post
  @Delete(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async closeJobPost(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ServiceResult<JobPost>> {
    return this.jobPostsService.closeJobPost(user.id, id);
  }
}
