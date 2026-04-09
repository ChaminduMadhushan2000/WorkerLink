import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';
import { JobPostStatus } from '../entities/job-post.entity';

export class FilterJobPostsDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(JobPostStatus)
  status?: JobPostStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
