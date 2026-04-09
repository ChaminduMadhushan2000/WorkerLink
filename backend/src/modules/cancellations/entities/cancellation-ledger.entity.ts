import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum CancellationEventType {
  CANCEL_ATTEMPT = 'cancel_attempt',
  CANCEL_ALLOWED = 'cancel_allowed',
  CANCEL_BLOCKED = 'cancel_blocked',
}

@Entity('cancellation_ledger')
export class CancellationLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @Column({ name: 'job_post_id', type: 'uuid' })
  jobPostId: string;

  @Column({ type: 'varchar', length: 20 })
  weekKey: string; // ISO week e.g. "2026-W14"

  @Column({ type: 'enum', enum: CancellationEventType })
  type: CancellationEventType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;
}
