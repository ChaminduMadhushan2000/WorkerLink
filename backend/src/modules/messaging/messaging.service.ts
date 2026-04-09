import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
  ) {}

  async saveMessage(
    senderId: string,
    jobPostId: string,
    recipientId: string,
    content: string,
  ): Promise<ServiceResult<Message>> {
    try {
      const message = this.messageRepository.create({
        senderId,
        jobPostId,
        recipientId,
        content,
      });
      const saved = await this.messageRepository.save(message);
      return { success: true, message: 'Message saved', data: saved };
    } catch (error: unknown) {
      this.logger.error(
        'saveMessage failed',
        error instanceof Error ? error.stack : error,
      );
      return { success: false, message: 'Failed to save message', data: null };
    }
  }

  async getMessages(
    userId: string,
    jobPostId: string,
  ): Promise<ServiceResult<Message[]>> {
    try {
      const messages = await this.messageRepository.find({
        where: [
          { jobPostId, senderId: userId },
          { jobPostId, recipientId: userId },
        ],
        order: { sentAt: 'ASC' },
        relations: ['sender'],
      });
      return { success: true, message: 'Messages fetched', data: messages };
    } catch (error: unknown) {
      this.logger.error(
        'getMessages failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
