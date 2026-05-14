# 艺育皮韵 - 前端应用

基于 Next.js 16 (App Router) 的前端应用，提供非遗皮雕教育平台的完整用户界面。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | 应用框架 (App Router) |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| CSS Modules | - | 样式方案 (原生 CSS, 无 Tailwind) |
| Zustand | 5 | 状态管理 |
| SWR | 2 | 数据请求 |
| Axios | 1 | HTTP 客户端 |
| React Hook Form | 7 | 表单处理 |
| Socket.IO Client | 4 | WebSocket 实时通信 |
| Lucide React | - | 图标库 |
| Recharts | 2 | 图表 |

## 快速开始

### 前置要求

- Node.js >= 20
- 后端 API 服务已启动 (默认 `http://localhost:3001`)

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，配置后端 API 地址:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=艺育皮韵
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

## 环境变量说明

所有环境变量详见 [.env.example](./.env.example)，以下是详细说明:

| 变量 | 必需 | 说明 | 默认值 |
|------|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 是 | 后端 API 完整地址 (含 `/api/v1`) | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_WS_URL` | 后端有 WebSocket 功能时 | WebSocket 地址 | 从 API_URL 自动推导 |
| `NEXT_PUBLIC_APP_NAME` | 否 | 应用名称 | `艺育皮韵` |

### 环境变量注意事项

- 所有 `NEXT_PUBLIC_` 前缀的变量会暴露给浏览器，**不要**在其中存放密钥
- `.env.local` 优先级最高，不会被 Git 追踪
- 修改环境变量后需要**重启**开发服务器

### 不同部署场景的配置示例

**本地开发 (前后端同机):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**分开部署 (前端独立域名):**

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
```

**Docker 部署 (通过 Nginx 反代):**

```env
NEXT_PUBLIC_API_URL=/api/v1
# 或填写完整地址
# NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
```

## 部署指南

### 方式一: 直接部署 (Node.js standalone)

Next.js 配置了 `output: 'standalone'`，可以独立运行:

```bash
# 1. 配置环境变量
cp .env.example .env.local
vim .env.local

# 2. 构建
npm run build

# 3. 启动 (使用 standalone 输出)
node .next/standalone/server.js
```

> 注意: standalone 模式需要同时复制静态资源:
> ```bash
> cp -r public .next/standalone/public
> cp -r .next/static .next/standalone/.next/static
> ```

使用 PM2 管理进程:

```bash
pm2 start .next/standalone/server.js --name leather-carving-web
```

### 方式二: Docker 部署

```bash
# 1. 构建镜像
docker build -t leather-carving-web .

# 2. 运行
docker run -d \
  --name lc-web \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1 \
  -e NEXT_PUBLIC_WS_URL=wss://api.your-domain.com \
  leather-carving-web
```

### 方式三: Vercel / Netlify 部署

1. 在平台中设置环境变量:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-domain.com/api/v1`
   - `NEXT_PUBLIC_WS_URL` = `wss://your-api-domain.com`
2. 构建命令: `npm run build`
3. 输出目录: `.next`

## 前后端对接说明

### API 调用方式

前端通过 `src/lib/api-client.ts` 中的 Axios 实例统一调用后端 API:

```typescript
import { apiClient } from '@/lib/api-client';

// GET 请求
const res = await apiClient.get('/courses');
// 响应: { code: 0, message: 'success', data: [...] }

// POST 请求
const res = await apiClient.post('/auth/login', { email, password });
// 响应: { code: 0, message: 'success', data: { accessToken, refreshToken, user } }
```

### 认证流程

1. 用户登录后，`accessToken` 和 `refreshToken` 存储在 `localStorage`
2. 每次请求自动附带 `Authorization: Bearer <token>` 头
3. 收到 401 响应时，自动使用 refresh token 刷新
4. 刷新失败则清除 token 并跳转到登录页

### WebSocket 连接

实时通知通过 Socket.IO 连接:

```typescript
import { connectSocket } from '@/lib/socket';

const socket = connectSocket();
socket.on('notification:new', (data) => {
  // 处理新通知
});
```

### 文件上传

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'avatar'); // avatar | course | artwork | product | post

const res = await apiClient.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
// 响应: { url: 'https://...' }
```

### API 响应格式

所有接口返回统一格式:

```typescript
interface ApiResponse<T> {
  code: number;       // 0 表示成功
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

## 项目结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── app/             # App Router 路由页面
│   │   ├── (auth)/      # 登录、注册、忘记密码
│   │   ├── courses/     # 课程列表、详情
│   │   ├── learn/       # 学习页面
│   │   ├── shop/        # 商品列表、详情
│   │   ├── cart/        # 购物车
│   │   ├── checkout/    # 结算
│   │   ├── my-orders/   # 我的订单
│   │   ├── community/   # 社区
│   │   ├── gallery/     # 作品画廊
│   │   ├── patterns/    # 纹样库
│   │   ├── teacher/     # 教师工作台
│   │   ├── admin/       # 管理后台
│   │   └── ...
│   ├── components/      # 组件
│   │   ├── layout/      # 布局组件
│   │   ├── course/      # 课程组件
│   │   ├── product/     # 商品组件
│   │   ├── ai/          # AI 聊天组件
│   │   ├── admin/       # 管理后台组件
│   │   └── ui/          # 通用 UI 组件
│   ├── contexts/        # React Context (认证)
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # API 客户端、工具函数
│   │   ├── api-client.ts     # Axios 实例 (Token 管理、自动刷新)
│   │   ├── auth-api.ts       # 认证 API
│   │   ├── course-api.ts     # 课程 API
│   │   ├── product-api.ts    # 商品 API
│   │   ├── order-api.ts      # 订单 API
│   │   ├── community-api.ts  # 社区 API
│   │   ├── ai-api.ts         # AI API (SSE 流式)
│   │   ├── socket.ts         # WebSocket 客户端
│   │   └── ...
│   ├── middleware.ts    # 路由守卫 (登录态检查)
│   └── stores/          # Zustand 状态管理
│       ├── cart-store.ts       # 购物车 (localStorage 持久化)
│       ├── notification-store.ts # 通知
│       └── ui-store.ts         # UI 状态 (侧边栏、主题)
├── Dockerfile           # Docker 构建文件
├── next.config.ts       # Next.js 配置
└── package.json
```

## 页面路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/login` | 登录 | 未登录 |
| `/register` | 注册 | 未登录 |
| `/courses` | 课程列表 | 公开 |
| `/courses/[slug]` | 课程详情 | 公开 |
| `/learn/[courseId]` | 学习页面 | 登录 |
| `/shop` | 商品列表 | 公开 |
| `/shop/[slug]` | 商品详情 | 公开 |
| `/cart` | 购物车 | 登录 |
| `/checkout` | 结算 | 登录 |
| `/my-orders` | 我的订单 | 登录 |
| `/my-courses` | 我的课程 | 登录 |
| `/community` | 社区 | 公开 |
| `/community/[id]` | 帖子详情 | 公开 |
| `/gallery` | 作品画廊 | 公开 |
| `/gallery/[id]` | 作品详情 | 公开 |
| `/patterns` | 纹样库 | 公开 |
| `/create/artwork` | 发布作品 | 登录 |
| `/create/pattern` | 创建纹样 | 登录 |
| `/notifications` | 通知中心 | 登录 |
| `/profile` | 个人资料 | 登录 |
| `/settings` | 设置 | 登录 |
| `/teacher` | 教师工作台 | 教师 |
| `/admin` | 管理后台 | 管理员 |

## 开发命令

```bash
npm run dev              # 开发服务器 (http://localhost:3000)
npm run build            # 生产构建
npm run start            # 生产模式启动
npm run lint             # ESLint 检查
npx playwright test      # E2E 测试
```

## 测试账号

导入后端种子数据后，可使用以下账号登录:

| 账号 | 密码 | 角色 | 可访问 |
|------|------|------|--------|
| admin@leather-carving.com | Admin123! | 管理员 | 管理后台 |
| teacher@leather-carving.com | Teacher123! | 教师 | 教师工作台 |
| learner@leather-carving.com | Learner123! | 学员 | 学员功能 |
