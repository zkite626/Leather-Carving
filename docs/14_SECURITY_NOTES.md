# 14 — 安全注意事项 | 艺育皮韵

---

## 一、安全清单

### 认证安全

| 措施 | 说明 |
|------|------|
| 密码哈希 | bcrypt, cost factor ≥ 12 |
| JWT HttpOnly | Token 存储于 HttpOnly Secure Cookie，防 XSS |
| Token 轮换 | Refresh Token 使用后立即失效 |
| 登录锁定 | 5 次失败锁定 15 分钟 |
| 密码强度 | 前后端双重校验（≥8 位，大小写+数字） |

### 输入安全

| 措施 | 说明 |
|------|------|
| 参数验证 | NestJS ValidationPipe + class-validator 全局开启 |
| SQL 注入 | Prisma 参数化查询，禁止原始 SQL 拼接 |
| XSS 防护 | 用户输入 HTML 转义；富文本使用 DOMPurify |
| CSRF | Cookie SameSite=Strict + CSRF Token（表单提交） |
| 文件上传 | 类型白名单 + 大小限制 + 重命名 + 病毒扫描 |

### 传输安全

| 措施 | 说明 |
|------|------|
| HTTPS | 全站强制 HTTPS，HSTS Header |
| CORS | 严格限制 Origin 白名单 |
| Helmet | 设置安全响应头（CSP, X-Frame-Options 等） |

### 数据安全

| 措施 | 说明 |
|------|------|
| API Key 加密 | AI 模型 API Key 使用 AES-256 加密存储 |
| 数据脱敏 | 日志中隐藏密码、Token、API Key |
| 最小权限 | 数据库用户仅授予必要权限 |
| 审计日志 | 关键操作（删除、角色变更、配置修改）记录审计日志 |

### 速率限制

| 端点 | 限制 | 窗口 |
|------|------|------|
| `/auth/login` | 5 次 | 1 分钟 |
| `/auth/register` | 3 次 | 1 分钟 |
| `/upload/*` | 10 次 | 1 分钟 |
| `/ai/*` | 20 次 | 1 分钟 |
| 通用 API | 100 次 | 1 分钟 |

---

## 二、API Key 管理规范

- **绝不**将 API Key 提交到 Git 仓库
- 使用 `.env.local` 存储敏感配置（已加入 .gitignore）
- 生产环境使用环境变量注入或密钥管理服务
- AI 模型 API Key 在数据库中 AES-256 加密存储
- 前端**绝不**直接调用 AI Provider，统一通过后端代理

---

## 三、依赖安全

- 定期运行 `pnpm audit` 检查依赖漏洞
- 使用 Dependabot / Renovate 自动更新依赖
- 锁定依赖版本（pnpm-lock.yaml）
