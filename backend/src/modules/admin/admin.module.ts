import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../auth/entities/user.entity';
import { Contractor } from '../contractor/entities/contractor.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { CancellationLedger } from '../cancellations/entities/cancellation-ledger.entity';
import { AdminAuditLog } from '../cancellations/entities/admin-audit-log.entity';
import { JobPostsModule } from '../job-posts/job-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Contractor,
      JobPost,
      CancellationLedger,
      AdminAuditLog,
    ]),
    JobPostsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
