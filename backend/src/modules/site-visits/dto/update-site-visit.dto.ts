import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SiteVisitStatus } from '../entities/site-visit.entity';

export class UpdateSiteVisitDto {
  @IsOptional()
  @IsEnum(SiteVisitStatus)
  status?: SiteVisitStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
