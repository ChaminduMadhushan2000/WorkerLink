import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export const EMAIL_QUEUE = 'EMAIL_QUEUE';

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobPayload>): Promise<void> {
    try {
      this.logger.log(
        JSON.stringify({
          action: 'EMAIL_PROCESSING',
          to: job.data.to,
          subject: job.data.subject,
          jobId: job.id,
        }),
      );
      // TODO: connect real email provider (Brevo/SendGrid)
      // For now log the email — replace with actual provider call
      this.logger.log(`Email sent to ${job.data.to}: ${job.data.subject}`);
    } catch (error: unknown) {
      this.logger.error(
        'handleSendEmail failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
