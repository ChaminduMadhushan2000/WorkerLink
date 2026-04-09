import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost } from './entities/job-post.entity';
import { JobPostStatusHistory } from './entities/job-post-status-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, JobPostStatusHistory])],
  controllers: [JobPostsController],
  providers: [JobPostsService],
  exports: [JobPostsService],
})
export class JobPostsModule {}
