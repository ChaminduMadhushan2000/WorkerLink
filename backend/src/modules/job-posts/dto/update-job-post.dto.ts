import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateJobPostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

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
