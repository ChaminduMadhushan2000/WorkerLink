import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { JobPost } from '../../job-posts/entities/job-post.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobPost)
  @JoinColumn({ name: 'job_post_id' })
  jobPost: JobPost;

  @Column({ name: 'job_post_id', type: 'uuid' })
  jobPostId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  sentAt: Date;
}
