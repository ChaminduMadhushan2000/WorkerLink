import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateJobPostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @IsUUID()
  categoryId: string;

  @IsString()
  @MaxLength(100)
  district: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressText?: string;

  @IsOptional()
  @IsDateString()
  preferredStartDateFrom?: string;

  @IsOptional()
  @IsDateString()
  preferredStartDateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  materialsNote?: string;
}
