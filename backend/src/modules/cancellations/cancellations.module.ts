import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationsController } from './cancellations.controller';
import { CancellationsService } from './cancellations.service';
import { CancellationLedger } from './entities/cancellation-ledger.entity';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { Contractor } from '../contractor/entities/contractor.entity';
import { User } from '../auth/entities/user.entity';
import { JobPostsModule } from '../job-posts/job-posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CancellationLedger,
      AdminAuditLog,
      Contractor,
      User,
    ]),
    JobPostsModule,
  ],
  controllers: [CancellationsController],
  providers: [CancellationsService],
  exports: [CancellationsService],
})
export class CancellationsModule {}
