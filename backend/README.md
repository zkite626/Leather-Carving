# 艺育皮韵 - 后端 API 服务

基于 NestJS 11 的后端 API 服务，提供用户认证、课程管理、电商系统、社区互动、AI 助手等完整 API。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 11 | 应用框架 |
| Prisma | 7.8 | ORM / 数据库迁移 |
| PostgreSQL | 16 | 主数据库 |
| Redis | 7 | 缓存/会话 (可选, 自动降级) |
| MinIO | latest | 文件存储 (可选, 自动降级为本地存储) |
| Socket.IO | 4 | WebSocket 实时通信 |
| Passport + JWT | - | 身份认证 |
| Swagger | - | API 文档 |
| Sharp | - | 图片处理 |

## 快速开始

### 前置要求

- Node.js >= 20
- PostgreSQL 16+
- (可选) Redis 7+
- (可选) MinIO

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env, 填入数据库连接等配置
```

### 3. 数据库初始化

```bash
# 生成 Prisma Client
npm run prisma:generate

# 执行数据库迁移 (开发环境)
npx prisma migrate dev

# 导入种子数据 (可选, 创建测试用户和示例数据)
npx prisma db seed
```

### 4. 启动服务

```bash
# 开发模式 (热重载)
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务默认运行在 `http://localhost:5000`

- API 根路径: `http://localhost:5000/api/v1`
- Swagger 文档: `http://localhost:5000/api/docs`

## 环境变量说明

所有环境变量详见 [.env.example](./.env.example)，以下是分类说明：

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT 签名密钥 | `openssl rand -hex 32` 生成 |
| `CORS_ORIGIN` | 允许的前端域名 | `https://your-domain.com` |

### 可选变量

| 变量 | 说明 | 默认值 | 降级行为 |
|------|------|--------|----------|
| `REDIS_HOST` | Redis 地址 | 不设置 | 内存缓存 |
| `REDIS_PORT` | Redis 端口 | `6379` | - |
| `REDIS_PASSWORD` | Redis 密码 | 空 | - |
| `MINIO_ENDPOINT` | MinIO 地址 | 不设置 | 本地磁盘存储 |
| `MINIO_PORT` | MinIO 端口 | `9000` | - |
| `MINIO_ACCESS_KEY` | MinIO 密钥 | `minioadmin` | - |
| `MINIO_SECRET_KEY` | MinIO 密钥 | `minioadmin` | - |
| `MINIO_USE_SSL` | MinIO SSL | `false` | - |
| `MINIO_PUBLIC_URL` | MinIO 公开 URL | `http://localhost:9000` | - |
| `LOCAL_UPLOAD_DIR` | 本地上传目录 | `uploads` | - |
| `PORT` | 服务端口 | `5000` | - |
| `NODE_ENV` | 运行环境 | `development` | - |

### 降级机制

- **Redis 不可用**: AI 聊天历史存储到内存 (重启丢失), 其他功能不受影响
- **MinIO 不可用**: 文件上传到本地 `uploads/` 目录, 通过 `/uploads/` 路径访问

## 部署指南

### 方式一: 直接部署 (Node.js)

```bash
# 1. 安装依赖
npm ci

# 2. 配置环境变量
cp .env.example .env
vim .env  # 填入生产环境配置

# 3. 生成 Prisma Client 并同步数据库结构
npm run prisma:generate
npm run prisma:db:push

# 4. 构建并启动（build 会再次生成 Prisma Client，避免旧类型残留）
npm run build
npm run start:prod
```

1Panel / 宝塔等源码部署面板建议配置：

```bash
安装命令: npm ci
构建命令: npm run build
启动命令: npm run start:prod
运行目录: backend
```

当前仓库尚未提交 `prisma/migrations/`，首次部署请使用 `npm run prisma:db:push`
同步数据库结构；后续如果改为迁移制，再使用 `npm run prisma:migrate:deploy`。

> 如果部署日志出现 `Property 'user' does not exist on type 'PrismaService'` 或
> `@prisma/client has no exported member 'User'`，说明当前服务器上的 Prisma Client
> 不是由本仓库的 `prisma/schema.prisma` 生成的。现在 `npm ci`、`npm run build`
> 和 `npm run start:prod` 都会自动重新生成并校验 Prisma Client；如果仍失败，请删除
> 服务器上的 `backend/node_modules` 后重新部署。

建议使用 PM2 管理进程:

```bash
# 安装 PM2
npm install -g pm2

# 启动
pm2 start dist/main.js --name leather-carving-api

# 设置开机自启
pm2 startup
pm2 save
```

### 方式二: Docker 部署

```bash
# 1. 构建镜像
docker build -t leather-carving-api .

# 2. 运行 (使用 --env-file 或 -e 传入环境变量)
docker run -d \
  --name lc-api \
  -p 5000:5000 \
  --env-file .env \
  leather-carving-api
```

### 方式三: Docker Compose (含数据库)

使用项目根目录的 `infra/` 部署全套服务:

```bash
cd infra

# 开发环境 (仅数据库)
docker compose -f docker-compose.dev.yml up -d

# 生产环境 (全套)
# 先创建 .env 文件配置环境变量
cp ../.env.example .env
vim .env
docker compose -f docker-compose.prod.yml up -d --build
```

## 种子数据

种子文件 `prisma/seed.ts` 创建以下测试数据:

| 类型 | 账号 | 密码 | 角色 |
|------|------|------|------|
| 管理员 | admin@leather-carving.com | Admin123! | ADMIN |
| 教师 | teacher@leather-carving.com | Teacher123! | TEACHER |
| 商户 | merchant@leather-carving.com | Merchant123! | MERCHANT |
| 学员 | learner@leather-carving.com | Learner123! | LEARNER |

还包含: 产品分类、示例商品、轮播图等。

## API 文档

启动服务后访问 Swagger 文档: `http://localhost:5000/api/docs`

### 主要 API 模块

| 路径前缀 | 模块 | 说明 |
|----------|------|------|
| `/auth` | 认证 | 登录、注册、刷新 Token |
| `/users` | 用户 | 个人资料管理 |
| `/courses` | 课程 | 课程列表、详情、报名、学习进度 |
| `/reviews` | 评价 | 课程/商品评价 |
| `/upload` | 上传 | 图片/视频上传 |
| `/shop/products` | 商品 | 商品列表、详情 |
| `/shop/categories` | 分类 | 商品分类树 |
| `/shop/orders` | 订单 | 创建、支付、取消、确认 |
| `/shop/cart` | 购物车 | 增删改查 |
| `/community/posts` | 社区 | 帖子发布、列表、详情 |
| `/comments` | 评论 | 嵌套评论 |
| `/favorites` | 收藏 | 多态收藏 |
| `/artworks` | 作品 | 作品画廊 |
| `/patterns` | 纹样 | 纹样素材库 |
| `/notifications` | 通知 | 消息通知 |
| `/ai` | AI | 聊天(SSE流式)、纹样生成、推荐 |
| `/admin` | 管理 | 后台管理 (需管理员权限) |
| `/health` | 健康检查 | 服务状态 |

### 响应格式

所有 API 响应统一格式:

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

分页响应额外包含:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 认证方式

使用 Bearer Token 认证，在请求头中添加:

```
Authorization: Bearer <access_token>
```

Token 刷新流程: 当 API 返回 401 时，使用 refresh token 调用 `/auth/refresh` 获取新的 access token。

## 项目结构

```
backend/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义 (22 个模型)
│   ├── seed.ts            # 种子数据
│   └── migrations/        # 数据库迁移文件
├── src/
│   ├── main.ts            # 应用入口
│   ├── app.module.ts      # 根模块
│   ├── common/            # 公共组件
│   │   ├── guards/        # JWT 守卫、角色守卫
│   │   ├── interceptors/  # 响应转换、日志
│   │   ├── filters/       # 异常过滤器
│   │   ├── pipes/         # 验证管道
│   │   └── decorators/    # 自定义装饰器
│   └── modules/           # 功能模块 (25 个)
│       ├── prisma/        # Prisma 客户端
│       ├── redis/         # Redis 服务 (含内存降级)
│       ├── storage/       # 文件存储 (MinIO/本地)
│       ├── auth/          # 认证
│       ├── user/          # 用户
│       ├── course/        # 课程
│       ├── payment/       # 支付
│       ├── order/         # 订单
│       ├── ai/            # AI 助手
│       ├── gateway/       # WebSocket
│       ├── admin/         # 后台管理
│       └── ...            # 其他模块
├── Dockerfile             # Docker 构建文件
└── package.json
```

## 开发命令

```bash
npm run start:dev          # 开发模式 (热重载)
npm run build              # 构建
npm run start:prod         # 生产模式启动
npm run lint               # ESLint 检查
npm run test               # 单元测试
npm run test:e2e           # 端到端测试
npx prisma migrate dev     # 创建迁移
npx prisma db seed         # 导入种子数据
npx prisma studio          # 数据库可视化管理
```
