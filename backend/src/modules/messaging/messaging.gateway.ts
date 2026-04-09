import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';

interface SendMessagePayload {
  jobPostId: string;
  recipientId: string;
  content: string;
}

interface JoinRoomPayload {
  jobPostId: string;
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
  namespace: '/messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth['token'] as string) ||
        (client.handshake.headers['authorization'] as string)?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      this.connectedUsers.set(client.id, payload.sub);
      this.logger.log(`Client connected: ${client.id} userId: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): void {
    const room = `job_post_${payload.jobPostId}`;
    void client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const result = await this.messagingService.saveMessage(
      senderId,
      payload.jobPostId,
      payload.recipientId,
      payload.content,
    );

    if (result.success && result.data) {
      const room = `job_post_${payload.jobPostId}`;
      this.server.to(room).emit('new_message', result.data);
    }
  }
}
