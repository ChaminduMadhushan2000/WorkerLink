import {
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { PriceFormat } from '../entities/proposal.entity';

export class CreateProposalDto {
  @IsEnum(PriceFormat)
  priceFormat: PriceFormat;

  @IsInt()
  @Min(1)
  proposalPriceLkrCents: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  estimatedDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsBoolean()
  siteVisitRequested?: boolean;
}
