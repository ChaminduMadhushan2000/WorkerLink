import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { EmailProcessor, EMAIL_QUEUE } from './processors/email.processor';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE })],
  providers: [NotificationsService, EmailProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
