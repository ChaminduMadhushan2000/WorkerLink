import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobPost } from '../../job-posts/entities/job-post.entity';
import { Contractor } from '../../contractor/entities/contractor.entity';

export enum AgreementStatus {
  PROPOSED = 'proposed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('agreements')
export class Agreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobPost)
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;

  @Column({ name: 'job_post_id', type: 'uuid' })
  jobPostId: string;

  @ManyToOne(() => Contractor)
  @JoinColumn({ name: 'contractor_id' })
  contractor: Contractor;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @Column({ name: 'proposed_by_user_id', type: 'uuid' })
  proposedByUserId: string;

  // Locked price in LKR cents — immutable once accepted
  @Column({ name: 'final_labor_price_lkr_cents', type: 'int' })
  finalLaborPriceLkrCents: number;

  @Column({ type: 'int', nullable: true })
  estimatedDays: number | null;

  @Column({ type: 'text', nullable: true })
  terms: string | null;

  @Column({
    type: 'enum',
    enum: AgreementStatus,
    default: AgreementStatus.PROPOSED,
  })
  status: AgreementStatus;

  @Column({ type: 'uuid', nullable: true })
  acceptedByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
