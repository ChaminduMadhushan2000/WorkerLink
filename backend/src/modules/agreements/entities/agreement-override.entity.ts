import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('agreement_overrides')
export class AgreementOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agreement_id', type: 'uuid' })
  agreementId: string;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @Column({ type: 'varchar', length: 500 })
  reason: string;

  @Column({ type: 'jsonb' })
  changesMade: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;
}
