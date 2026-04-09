import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_admin_id', type: 'uuid' })
  actorAdminId: string;

  @Column({ name: 'subject_contractor_id', type: 'uuid', nullable: true })
  subjectContractorId: string | null;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;
}
