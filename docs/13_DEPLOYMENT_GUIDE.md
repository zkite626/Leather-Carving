# 13 — 部署与运维指南 | 艺育皮韵

---

## 一、环境划分

| 环境 | 用途 | 数据库 | 部署方式 |
|------|------|--------|----------|
| `local` | 本地开发 | Docker PostgreSQL | cd frontend && npm run dev |
| `staging` | 测试验证 | 独立实例 | Docker Compose |
| `production` | 生产环境 | 云数据库 | Docker Compose / K8s |

---

## 二、Docker Compose（生产）

```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  web:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports: ["3000:3000"]
    env_file: .env.production
    depends_on: [api]

  api:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports: ["4000:4000"]
    env_file: .env.production
    depends_on: [postgres, redis, minio, meilisearch]

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: leather_carving
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes: ["redisdata:/data"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes: ["miniodata:/data"]
    ports: ["9000:9000", "9001:9001"]

  meilisearch:
    image: getmeili/meilisearch:v1
    volumes: ["meilidata:/meili_data"]
    environment:
      MEILI_MASTER_KEY: ${MEILI_KEY}

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infra/nginx/ssl:/etc/nginx/ssl
    depends_on: [web, api]

volumes:
  pgdata:
  redisdata:
  miniodata:
  meilidata:
```

---

## 三、环境变量模板（.env.example）

```bash
# === 数据库 ===
DATABASE_URL=postgresql://user:pass@localhost:5432/leather_carving
DB_USER=leather_user
DB_PASSWORD=secure_password

# === Redis ===
REDIS_URL=redis://localhost:6379

# === JWT ===
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# === 存储 ===
STORAGE_PROVIDER=minio          # minio | aliyun_oss
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
# OSS_ACCESS_KEY_ID=
# OSS_ACCESS_KEY_SECRET=
# OSS_BUCKET=
# OSS_REGION=

# === AI ===
AI_DEFAULT_BASE_URL=https://api.deepseek.com
AI_DEFAULT_API_KEY=sk-xxx
AI_DEFAULT_MODEL=deepseek-chat

# === Meilisearch ===
MEILI_HOST=http://localhost:7700
MEILI_KEY=your-master-key

# === 邮件 ===
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=noreply@example.com
SMTP_PASS=password
SMTP_FROM="艺育皮韵 <noreply@example.com>"

# === 应用 ===
APP_NAME=艺育皮韵
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
NODE_ENV=development
```

---

## 四、源码部署（Node.js / 1Panel）

后端源码部署必须以 `backend/` 为运行目录，确保 Prisma Client 由当前
`backend/prisma/schema.prisma` 生成。

```bash
cd backend
npm ci
npm run prisma:db:push
npm run build
npm run start:prod
```

1Panel Node 运行环境建议：

```bash
安装命令: npm ci
构建命令: npm run build
启动命令: npm run start:prod
运行目录: backend
```

`npm ci`、`npm run build`、`npm run start:prod` 都会触发
`npm run prisma:generate`，并校验生成后的 `@prisma/client` 是否包含
`UserRole`、`OrderStatus`、`user`、`product`、`systemSetting` 等项目模型。
如果日志出现 `Property 'user' does not exist on type 'PrismaService'`，删除
服务器上的 `backend/node_modules` 后重新执行上述命令。

当前仓库尚未提交 `prisma/migrations/`，首次部署使用 `npm run prisma:db:push`
同步数据库结构；后续采用迁移制后，再切换为 `npm run prisma:migrate:deploy`。

---

## 五、CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: bash ../scripts/sync-shared.sh
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

## 六、监控与日志

| 组件 | 工具 | 说明 |
|------|------|------|
| 应用日志 | Winston → 文件/stdout | JSON 结构化日志 |
| 指标采集 | Prometheus | API 响应时间/错误率 |
| 可视化 | Grafana | 仪表盘展示 |
| 告警 | Grafana Alerting | 异常告警至邮件/钉钉 |
| 健康检查 | `/api/v1/health` | DB/Redis/OSS 连通性 |

---

## 七、备份策略

| 数据 | 频率 | 保留 | 方式 |
|------|------|------|------|
| PostgreSQL | 每日全量 + WAL 增量 | 30 天 | pg_dump + WAL 归档 |
| MinIO | 每周 | 90 天 | mc mirror 到备份存储 |
| Redis | RDB 快照 + AOF | 7 天 | 自动 |
