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

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

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
      const token = String(
        client.handshake.auth?.token ||
          client.handshake.headers?.authorization?.replace('Bearer ', ''),
      );

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret',
      ) as unknown as JwtPayload;
      const userId = payload.sub;

      const clientData = client.data as Record<string, unknown>;
      clientData.userId = userId;
      void client.join(`user:${userId}`);
      this.logger.log(`Client ${client.id} connected as user ${userId}`);
    } catch {
      this.logger.warn(`Client ${client.id} auth failed`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('notification:read')
  handleNotificationRead(client: Socket, data: { notificationId: string }) {
    const clientData = client.data as Record<string, unknown>;
    this.logger.debug(
      `User ${String(clientData.userId)} read notification ${data.notificationId}`,
    );
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification:new', notification);
  }
}
