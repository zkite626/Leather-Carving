# 10 — 实时通信设计 | 艺育皮韵

> Socket.IO 实时通信 + BullMQ 任务队列。

---

## 一、WebSocket 场景

| 场景 | 事件 | 方向 |
|------|------|------|
| 订单状态变更 | `order:statusChange` | Server → Client |
| 新通知 | `notification:new` | Server → Client |
| 直播互动 | `live:message` / `live:join` | 双向 |
| AI 对话流式 | `ai:stream` | Server → Client |
| 在线人数 | `presence:count` | Server → Client |

---

## 二、NestJS Gateway

```typescript
@WebSocketGateway({ cors: true, namespace: '/ws' })
export class AppGateway {
  @WebSocketServer() server: Server;

  // 用户上线，加入个人房间
  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    client.join(`user:${userId}`);
  }

  // 发送通知给特定用户
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // 直播房间
  @SubscribeMessage('live:join')
  handleJoinLive(client: Socket, roomId: string) {
    client.join(`live:${roomId}`);
  }
}
```

---

## 三、任务队列（BullMQ）

| 队列 | 任务 | 优先级 |
|------|------|--------|
| `email` | 发送邮件（验证码/订单通知/欢迎） | 高 |
| `media` | 视频转码、图片压缩、水印 | 中 |
| `ai` | AI 异步任务（批量推荐、纹样生成） | 中 |
| `search` | 搜索索引同步（课程/商品/作品） | 低 |
| `notification` | 推送通知 | 中 |
| `analytics` | 数据统计聚合 | 低 |

```typescript
// 使用示例
@Processor('email')
export class EmailProcessor {
  @Process('send-verification')
  async handleVerification(job: Job<{ email: string; code: string }>) {
    await this.mailService.sendVerificationCode(job.data.email, job.data.code);
  }
}
```
