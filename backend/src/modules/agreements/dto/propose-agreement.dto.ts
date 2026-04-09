import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';

export class ProposeAgreementDto {
  @IsUUID()
  jobPostId: string;

  @IsUUID()
  contractorId: string;

  @IsInt()
  @Min(1)
  finalLaborPriceLkrCents: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;
}
