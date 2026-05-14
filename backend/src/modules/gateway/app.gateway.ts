import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret',
      ) as any;
      const userId = payload.sub;

      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`Client ${client.id} connected as user ${userId}`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} auth failed`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('notification:read')
  handleNotificationRead(client: Socket, data: { notificationId: string }) {
    this.logger.debug(
      `User ${client.data.userId} read notification ${data.notificationId}`,
    );
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification:new', notification);
  }
}
