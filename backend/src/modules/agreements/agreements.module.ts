import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';
import { Agreement } from './entities/agreement.entity';
import { AgreementOverride } from './entities/agreement-override.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { JobPostsModule } from '../job-posts/job-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agreement, AgreementOverride, JobPost]),
    JobPostsModule,
  ],
  controllers: [AgreementsController],
  providers: [AgreementsService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
