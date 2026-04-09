import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { JobPost } from './job-post.entity';
import { JobPostStatus } from './job-post.entity';

@Entity('job_post_status_history')
export class JobPostStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobPost)
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;

  @Column({ name: 'job_post_id', type: 'uuid' })
  jobPostId: string;

  @Column({ type: 'enum', enum: JobPostStatus })
  fromStatus: JobPostStatus;

  @Column({ type: 'enum', enum: JobPostStatus })
  toStatus: JobPostStatus;

  @Column({ type: 'uuid', nullable: true })
  changedByUserId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;
}
