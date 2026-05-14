# Wave 1 开发提示词 — 基础架构 + 认证 + 设计系统

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 (App Router) + NestJS 11 + PostgreSQL 16 + Prisma + Redis
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 1 — 基础架构搭建

## 你的角色
你是一位高级全栈工程师，正在搭建「艺育皮韵」非遗教育平台的基础架构。
你需要严格遵循 SDD（规范驱动开发）方法论，所有实现必须对照 docs/ 下的规范文档。

## 核心规范文档（必读）
在开始编码前，你必须阅读以下文档并严格遵循：
- docs/00_PROJECT_OVERVIEW.md — 项目总览与目录结构
- docs/01_TECH_ARCHITECTURE.md — 技术架构与分层设计
- docs/02_DATA_MODELS.md — Prisma Schema 定义
- docs/04_UI_DESIGN_SYSTEM.md — CSS Variables 设计系统
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略
- docs/05_AUTH_DESIGN.md — JWT 认证方案
- docs/15_CODING_STANDARDS.md — 编码规范
- AGENTS.md — AI 开发规范

## Wave 1 完整任务

### 一、项目初始化
1. 创建 frontend/ 目录，使用 `npx create-next-app@latest ./`（App Router, TypeScript, ESLint, 无 Tailwind, src/ 目录）
2. 创建 backend/ 目录，使用 `npx @nestjs/cli new ./`（strict mode）
3. 创建 shared/types/、shared/validators/、shared/utils/ 共享代码目录
4. 编写 scripts/sync-shared.sh，将 shared/ 同步到 frontend/src/shared 和 backend/src/shared
5. 前后端各自独立 package.json，可分别启动：
   - 前端：`cd frontend && npm run dev`
   - 后端：`cd backend && npm run start:dev`
6. 前端通过环境变量 `NEXT_PUBLIC_API_URL` 配置后端地址
7. 配置 ESLint + Prettier + TypeScript 严格模式
8. 创建 .env.example 环境变量模板

### 二、基础设施
1. 创建 infra/docker-compose.dev.yml（PostgreSQL 16 + Redis 7 + MinIO）
2. 后端安装 Prisma，按照 docs/02_DATA_MODELS.md 定义完整 schema.prisma：
   - 使用 PostgreSQL provider，UUID 主键
   - 软删除字段(deleted_at)，审计字段(created_at, updated_at)
   - 所有表名 @@map() 映射 snake_case，字段名 @map() 映射
   - 完整关联关系和索引
3. 执行 `prisma migrate dev` 创建数据库表
4. 编写 prisma/seed.ts 种子数据（各角色测试用户）

### 三、NestJS 后端骨架
1. 配置全局 ValidationPipe、ExceptionFilter、TransformInterceptor
2. 统一响应格式 ApiResponse<T>（参照 docs/01_TECH_ARCHITECTURE.md 第四节）
3. 配置 Swagger/OpenAPI 文档（/api/docs）
4. 配置 CORS、Helmet、RateLimit
5. 实现健康检查端点 GET /api/v1/health

### 四、认证模块（参照 docs/05_AUTH_DESIGN.md）
1. 实现 auth.module.ts, auth.controller.ts, auth.service.ts
2. POST /api/v1/auth/register — bcrypt 哈希(12 rounds)
3. POST /api/v1/auth/login — 签发 AccessToken(2h) + RefreshToken(7d)
4. POST /api/v1/auth/refresh — Token 轮换（旧 Token 立即失效）
5. POST /api/v1/auth/logout — Redis 中删除 RefreshToken
6. 实现 JwtAuthGuard + RolesGuard（自定义 @Roles() 装饰器）+ OwnerGuard
7. GET /api/v1/users/me — 获取当前用户
8. PATCH /api/v1/users/me — 更新个人信息
9. DTO 使用 class-validator 验证：RegisterDto, LoginDto, RefreshDto

### 五、Next.js 前端骨架（参照 docs/04_UI_DESIGN_SYSTEM.md + docs/08_COMPONENT_SPEC.md）
1. globals.css 设计系统：完整 CSS Variables（色彩/排版/间距/阴影/圆角/动画/暗色模式）
2. 引入 Google Fonts: Inter + Noto Sans SC + Outfit
3. 根 Layout: 暗色模式支持（[data-theme="dark"]）、字体加载、metadata
4. 基础 UI 组件（仅使用 Vanilla CSS，不用 Tailwind）：
   - Button: primary/accent/ghost/text/danger 变体，sm/md/lg 尺寸，loading 态
   - Card: default/outlined/elevated 变体，hoverable 效果，可选皮革纹理叠加
   - Input/Textarea: label, error, hint, prefix/suffix icon
   - Modal: fade+scale 动画，backdrop blur
   - Toast: success/error/warning/info，自动消失
   - Skeleton: shimmer 动画
   - Avatar, Tag, Pagination
5. 布局组件：
   - SiteHeader: 毛玻璃效果导航栏（64px），Logo + 导航 + 搜索 + 用户菜单
   - SiteSidebar: 可折叠侧边栏
   - Footer: 平台信息 + 快速导航
   - ThemeToggle: 亮色/暗色切换（localStorage 持久化）
6. 配置 middleware.ts 路由保护

### 六、认证页面
1. /login — 对照 `docs/page-designs/images/02-learner-auth-dashboard.png`，使用统一皮革工坊视觉、紧凑表单和一致按钮样式
2. /register — 同上风格，分步注册，保持与登录页同一视觉母版
3. /forgot-password — 三步找回密码流程，样式对照 `02-learner-auth-dashboard.png`
4. AuthContext + useAuth Hook
5. API Client 封装（axios/fetch + 自动附加 Token + Token 过期自动刷新）
6. 登录/注册表单验证（React Hook Form + Zod）

### 七、页面设计与美术资源
1. 所有前端页面必须先对照 `docs/17_PAGE_DESIGN_SPEC.md` 和 `docs/page-designs/README.md`。
2. Wave 1 重点参考 `docs/page-designs/images/02-learner-auth-dashboard.png`，建立后续复用的 Header、Sidebar、Card、Button、Input、Form 视觉语言。
3. 若缺登录/注册背景图、头像、皮革纹理等资源，优先使用 image_gen 按 `docs/page-designs/README.md` 的统一提示词生成。
4. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 创建本地占位资源并登记缺口，继续完成页面结构、交互和测试，不得被素材阻塞。

## 技术约束
- TypeScript 严格模式，禁止 any
- 所有 API 响应使用统一 ApiResponse<T> 格式
- 所有 DTO 使用 class-validator 装饰器
- 前后端共享类型通过 shared/types 引用（构建时同步）
- CSS Variables 命名前缀统一使用 --lc-
- 文件命名 kebab-case，组件名 PascalCase
- 每个模块包含 __tests__/ 目录
- 仅使用 Vanilla CSS，不使用 Tailwind
- 设计风格：皮革暖色 + 匠人工坊光影 + 壮锦纹样装饰
- 页面风格必须与 `docs/page-designs/images/` 已有设计板统一

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档，确保代码与规范保持一致：
- 如果新增了 API 端点 → 更新 docs/03_API_SPECIFICATION.md
- 如果修改了数据模型 → 更新 docs/02_DATA_MODELS.md
- 如果新增了组件 → 更新 docs/08_COMPONENT_SPEC.md
- 如果变更了目录结构 → 更新 docs/00_PROJECT_OVERVIEW.md
- 如果修改了技术方案 → 更新对应的技术文档
- 完成 Wave 后 → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
