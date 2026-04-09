import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Category } from '../../master-data/entities/category.entity';

export enum JobPostStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  NEGOTIATION = 'negotiation',
  PRICE_LOCKED = 'price_locked',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  addressText: string | null;

  @Column({ type: 'date', nullable: true })
  preferredStartDateFrom: Date | null;

  @Column({ type: 'date', nullable: true })
  preferredStartDateTo: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({
    type: 'enum',
    enum: JobPostStatus,
    default: JobPostStatus.DRAFT,
  })
  status: JobPostStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  materialsNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
