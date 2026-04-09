import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsEmail,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { AvailabilityStatus } from '../entities/contractor.entity';

export class CreateContractorProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @MaxLength(20)
  contactPhone: string;

  @IsEmail()
  @MaxLength(255)
  contactEmail: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  workforceSizeMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  workforceSizeMax?: number;
}
