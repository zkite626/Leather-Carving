# AGENTS.md — AI 辅助开发规范 | 艺育皮韵

> 本文档定义 AI 编码助手在本项目中的行为规范和最佳实践。

---

## 项目信息

- **项目名称**：艺育皮韵 — 非遗皮雕数字教育平台
- **技术栈**：Next.js 15 (App Router) + NestJS 11 + PostgreSQL 16 + Prisma + Redis
- **架构**：前后端分离（frontend/ + backend/ 独立部署）
- **开发方法论**：SDD（Specification-Driven Development，规范驱动开发）

---

## 核心规则

### 1. 规范优先

- **必须先读规范再写代码**。所有规范文档位于 `docs/` 目录
- 数据模型参照 `docs/02_DATA_MODELS.md`
- API 接口参照 `docs/03_API_SPECIFICATION.md`
- 组件规格参照 `docs/08_COMPONENT_SPEC.md`
- 如发现代码与规范不一致，以规范为准并更新代码

### 2. 类型安全

- TypeScript 严格模式，**禁止 any**
- 前后端共享类型通过 `shared/types` 引用，构建时复制到各项目
- 运行时验证使用 `shared/validators`（Zod）
- NestJS DTO 使用 `class-validator` + `class-transformer`

### 3. 命名约定

- 文件：kebab-case（`course-card.tsx`）
- 组件：PascalCase（`CourseCard`）
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 数据库表/列：snake_case
- CSS 变量：`--lc-` 前缀
- API 路由：`/api/v1/` 前缀，kebab-case

### 4. 样式规范

- **仅使用 Vanilla CSS**（CSS Modules 或全局 CSS Variables）
- **不使用 Tailwind CSS**
- 所有颜色/间距/字体/阴影使用 `docs/04_UI_DESIGN_SYSTEM.md` 中定义的 CSS Variables
- 暗色模式通过 `[data-theme="dark"]` 选择器实现

### 5. 代码结构

- NestJS 模块遵循 `module → controller → service → dto → entity` 结构
- Next.js 页面遵循 App Router 约定
- React 组件遵循 `props interface → component → styles` 结构
- 每个模块/组件包含 `__tests__/` 目录

### 6. 错误处理

- 后端：使用 NestJS 内置异常类（`BadRequestException` 等）
- 前端：SWR onError 全局处理 + try/catch 局部处理
- 所有异步操作必须有错误处理
- 统一错误响应格式（参照 `docs/01_TECH_ARCHITECTURE.md`）

### 7. Git 提交

- 使用 Conventional Commits 格式：`type(scope): description`
- type: feat / fix / docs / style / refactor / perf / test / chore
- scope: 模块名（auth, course, shop, community, ai, admin）

### 8. 安全原则

- 绝不在前端暴露 API Key
- 用户输入始终验证和转义
- 敏感数据日志脱敏
- 文件上传严格校验类型和大小

---

## 项目目录参考

```
leather-carving/
├── frontend/            # Next.js 15 前端（独立部署）
├── backend/             # NestJS 11 后端（独立部署）
├── shared/              # 共享代码（构建时复制到前后端）
│   ├── types/           # 共享 TypeScript 类型
│   ├── validators/      # Zod 验证 Schema
│   └── utils/           # 共享工具函数
├── docs/                # SDD 规范文档
├── infra/               # Docker / Nginx 配置
└── AGENTS.md            # 本文件
```

---

## 常用命令

```bash
# 前端（在 frontend/ 目录下）
cd frontend && npm run dev        # 启动前端开发服务器
cd frontend && npm run build      # 构建前端
cd frontend && npm run lint       # 前端代码检查

# 后端（在 backend/ 目录下）
cd backend && npm run start:dev   # 启动后端开发服务器
cd backend && npm run build       # 构建后端
cd backend && npm run lint        # 后端代码检查
cd backend && npm run test        # 运行测试

# 数据库（在 backend/ 目录下）
cd backend && npx prisma migrate dev    # 数据库迁移
cd backend && npx prisma generate       # 生成 Prisma Client
cd backend && npx prisma db seed        # 填充种子数据

# 共享类型同步
npm run sync:types    # 将 shared/ 复制到 frontend/src/shared 和 backend/src/shared
```

