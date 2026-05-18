# 艺育皮韵 — 非遗皮雕数字教育平台

> 致力于非物质文化遗产皮雕技艺的数字化教育与传承，让传统工艺在数字时代焕发新的生命力。

## 项目简介

艺育皮韵是一个集**课程学习、作品展示、匠人商城、社区交流、AI 辅助**于一体的非遗皮雕数字化教育平台。平台以广西壮锦、瑶族元素和喀斯特地域文化为设计灵感，采用"皮革质感 x 壮锦纹样 x 匠人暖光"的视觉体系。

### 核心功能

- **学技艺** — 分级课程体系（入门→精通→大师），视频教学、进度追踪、课时打卡
- **赏作品** — 皮雕作品画廊，瀑布流展示，支持 3D 模型预览
- **购好物** — 匠人商城，广西非遗特色商品，购物车→下单→支付完整闭环
- **入圈子** — 社区论坛，发帖/评论/点赞/挑战打卡
- **AI 助手** — 智能问答、纹样生成、课程推荐
- **教师后台** — 课程管理、学员管理、收入统计
- **管理后台** — 用户管理、内容审核、财务管理、系统配置

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + CSS Modules + Zustand + SWR |
| 后端 | NestJS 11 + Prisma + PostgreSQL + Redis |
| 实时 | Socket.IO (WebSocket) |
| 存储 | MinIO (S3 兼容对象存储) |
| AI | DeepSeek / OpenAI 兼容 API |
| 部署 | Docker Compose + Nginx 反向代理 |
| CI/CD | GitHub Actions |

## 项目结构

```
leather-carving/
├── frontend/          # Next.js 前端应用
│   ├── src/
│   │   ├── app/       # App Router 页面路由 (~30 路由)
│   │   ├── components/# UI 组件 (按领域组织)
│   │   ├── lib/       # API 客户端、状态管理
│   │   ├── stores/    # Zustand stores
│   │   └── shared/    # 共享类型 (从 root 同步)
│   └── public/        # 静态资源
├── backend/           # NestJS 后端 API
│   ├── src/
│   │   ├── modules/   # 业务模块 (20+ 模块)
│   │   ├── common/    # 守卫、拦截器、管道
│   │   └── shared/    # 共享类型 (从 root 同步)
│   └── prisma/        # 数据模型 (22 个模型)
├── shared/            # 前后端共享代码
├── infra/             # 基础设施配置
│   ├── docker-compose.dev.yml   # 开发环境
│   ├── docker-compose.prod.yml  # 生产环境
│   └── nginx/nginx.conf         # Nginx 配置
├── docs/              # 项目文档 (19 篇规范文档)
└── scripts/           # 工具脚本
```

## 快速开始

### 环境要求

- Node.js >= 20
- Docker & Docker Compose
- PostgreSQL 16 (可通过 Docker 启动)

### 1. 克隆项目

```bash
git clone <repository-url>
cd leather-carving
```

### 2. 启动数据库服务

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

### 3. 配置环境变量

```bash
# 后端
cp .env.example backend/.env
# 编辑 backend/.env 填入实际配置

# 前端
cp frontend/.env.example frontend/.env.local 2>/dev/null || true
```

### 4. 安装依赖 & 初始化数据库

```bash
# 同步共享类型
bash scripts/sync-shared.sh

# 后端
cd backend
npm install
npx prisma db push    # 同步数据库 schema
npx prisma db seed    # 填充测试数据 (可选)
npm run dev           # 启动后端 http://localhost:5000

# 前端 (新终端)
cd frontend
npm install
npm run dev           # 启动前端 http://localhost:3000
```

### 5. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:5000/api/v1
- API 文档: http://localhost:5000/api/docs (Swagger)

## 生产部署

### Docker Compose 一键部署

```bash
# 1. 配置生产环境变量
cp .env.example .env.production
# 编辑 .env.production 填入生产配置

# 2. 构建并启动
docker compose -f infra/docker-compose.prod.yml up -d --build

# 3. 查看日志
docker compose -f infra/docker-compose.prod.yml logs -f
```

生产环境包含 6 个服务：Nginx 反向代理、Next.js 前端、NestJS 后端、PostgreSQL、Redis、MinIO。

### 后端源码部署

```bash
cd backend
npm ci
npm run prisma:db:push
npm run build
npm run start:prod
```

在 1Panel 等 Node 源码部署面板中，请将运行目录设为 `backend`，安装命令设为
`npm ci`，构建命令设为 `npm run build`，启动命令设为 `npm run start:prod`。
安装、构建和生产启动都会自动生成并校验 Prisma Client，避免旧 client 导致
`Property 'user' does not exist on type 'PrismaService'`。

### 启用 HTTPS

1. 将 SSL 证书放置到 `infra/nginx/ssl/`
2. 编辑 `infra/nginx/nginx.conf`，取消 HTTPS server 块注释
3. 编辑 `infra/docker-compose.prod.yml`，取消 nginx SSL 卷挂载注释
4. 重启 nginx 容器

## 测试

```bash
# 后端单元测试
cd backend && npm test

# 前端 E2E 测试 (需要应用运行中)
cd frontend && npx playwright install chromium
npm run test:e2e
```

## 文档

详细文档位于 `docs/` 目录：

| 文档 | 内容 |
|------|------|
| `00_PROJECT_OVERVIEW.md` | 项目总览 |
| `01_TECH_ARCHITECTURE.md` | 技术架构 |
| `02_DATA_MODELS.md` | 数据模型 |
| `03_API_SPECIFICATION.md` | API 规范 |
| `04_UI_DESIGN_SYSTEM.md` | 设计系统 |
| `12_TESTING_STRATEGY.md` | 测试策略 |
| `13_DEPLOYMENT_GUIDE.md` | 部署指南 |
| `14_SECURITY_NOTES.md` | 安全规范 |
| `17_PAGE_DESIGN_SPEC.md` | 页面设计规范 |

## 贡献指南

1. Fork 项目并创建功能分支
2. 遵循 `docs/15_CODING_STANDARDS.md` 编码规范
3. 提交 PR 前确保 lint 通过、测试通过
4. PR 描述中说明变更内容和原因

## 许可证

本项目仅供学习与展示用途。
