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

export enum ProposalStatus {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn',
}

export enum PriceFormat {
  LUMP_SUM = 'lump_sum',
  DAILY_RATE = 'daily_rate',
}

@Entity('proposals')
export class Proposal {
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

  @Column({ type: 'enum', enum: PriceFormat })
  priceFormat: PriceFormat;

  // Money stored as INTEGER in LKR cents — guidebook rule
  @Column({ name: 'proposal_price_lkr_cents', type: 'int' })
  proposalPriceLkrCents: number;

  @Column({ type: 'int', nullable: true })
  estimatedDays: number | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'boolean', default: false })
  siteVisitRequested: boolean;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  status: ProposalStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
