import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { Message } from './entities/message.entity';
import { JobPost } from '../job-posts/entities/job-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, JobPost]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
