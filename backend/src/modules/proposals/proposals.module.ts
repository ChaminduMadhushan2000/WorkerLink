import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { Proposal } from './entities/proposal.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, JobPost])],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
