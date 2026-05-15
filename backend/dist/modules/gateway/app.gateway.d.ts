import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly config;
    private readonly logger;
    private readonly jwtSecret;
    constructor(config: ConfigService);
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleNotificationRead(client: Socket, data: {
        notificationId: string;
    }): void;
    sendToUser(userId: string, event: string, data: any): void;
    sendNotification(userId: string, notification: any): void;
}
