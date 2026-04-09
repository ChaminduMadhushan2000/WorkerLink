import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteVisitsController } from './site-visits.controller';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisit } from './entities/site-visit.entity';
import { Contractor } from '../contractor/entities/contractor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteVisit, Contractor])],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
  exports: [SiteVisitsService],
})
export class SiteVisitsModule {}
