import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { Message } from './entities/message.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('job-posts/:jobPostId')
  async getMessages(
    @CurrentUser() user: User,
    @Param('jobPostId') jobPostId: string,
  ): Promise<ServiceResult<Message[]>> {
    return this.messagingService.getMessages(user.id, jobPostId);
  }
}
