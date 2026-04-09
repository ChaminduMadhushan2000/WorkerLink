import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EMAIL_QUEUE, EmailJobPayload } from './processors/email.processor';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async sendEmail(payload: EmailJobPayload): Promise<void> {
    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    this.logger.log(
      JSON.stringify({
        action: 'EMAIL_QUEUED',
        to: payload.to,
        subject: payload.subject,
      }),
    );
  }

  async notifyProposalReceived(
    customerEmail: string,
    jobTitle: string,
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: 'New Proposal Received',
      body: `You have received a new proposal for your job post: ${jobTitle}`,
    });
  }

  async notifyPriceLocked(
    customerEmail: string,
    contractorEmail: string,
    jobTitle: string,
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: 'Price Locked — Job Agreement Confirmed',
      body: `The price has been locked for: ${jobTitle}`,
    });
    await this.sendEmail({
      to: contractorEmail,
      subject: 'Price Locked — Job Agreement Confirmed',
      body: `The price has been locked for: ${jobTitle}`,
    });
  }

  async notifyCancellation(
    recipientEmail: string,
    jobTitle: string,
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: 'Job Cancellation Notice',
      body: `A cancellation has been processed for: ${jobTitle}`,
    });
  }
}
