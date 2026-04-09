import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractorController } from './contractor.controller';
import { ContractorService } from './contractor.service';
import { Contractor } from './entities/contractor.entity';
import { Worker } from './entities/worker.entity';
import { Category } from '../master-data/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor, Worker, Category])],
  controllers: [ContractorController],
  providers: [ContractorService],
  exports: [ContractorService],
})
export class ContractorModule {}
