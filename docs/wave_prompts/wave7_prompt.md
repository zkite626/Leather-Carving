# Wave 7 开发提示词 — 打磨与部署

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 7 — 打磨与部署（最终阶段）
# 前置完成：Wave 1-6（全部功能开发完成）

## 你的角色
你是全栈工程师，本 Wave 聚焦性能优化、测试覆盖、生产部署和视觉打磨。

## 必读规范
- docs/12_TESTING_STRATEGY.md — 测试策略与 Wave 7 验收标准
- docs/13_DEPLOYMENT_GUIDE.md — 部署方案
- docs/14_SECURITY_NOTES.md — 安全检查
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 7 完整任务

### 一、全站视觉一致性与首页打磨
0. 全站页面先对照 `docs/page-designs/images/` 做视觉一致性巡检：
   - 公开页对照 `01-public-pages.png`
   - 认证与学员工作台对照 `02-learner-auth-dashboard.png`
   - 商城与订单对照 `03-shop-order-pages.png`
   - 社区与 AI 对照 `04-community-ai-pages.png`
   - 教师/管理后台对照 `05-teacher-pages.png`
1. 首页 `/` 彻底优化：
   - Hero 区：全幅皮雕/壮锦大背景图 + 暖光遮罩 + 大标题 + 视差滚动，保持 `01-public-pages.png` 的统一风格
   - 数据展示区：滚动数字统计（平台课程数、非遗工匠数等）
   - 四大核心板块："学技艺"、"赏作品"、"购好物"、"入圈子"，Hover 交互翻转或变色
   - 广西特色专区：横向滚动展示喀斯特/壮锦/瑶族元素皮雕
   - 名师展示区：传承人档案轮播
   - Footer：丰富的网站地图 + 平台信息 + 关注二维码
2. 动画增强（Framer Motion / CSS 动画）：
   - 页面间路由切换动画（Fade/Slide）
   - 列表元素 Intersection Observer 进入视口时的 `fadeInUp` 错开出现动画
   - 按钮点击波纹反馈、点赞收藏爱心微动画
   - 所有列表页（课程、作品、商品）加载骨架屏（Skeleton）替换原始 loading spinner

### 二、性能优化
1. 前端性能：
   - 替换所有 img 标签为 Next.js `<Image>`，启用 WebP 格式和自动懒加载
   - 动态组件引入 `next/dynamic`（3D 模型查看器、富文本编辑器、复杂图表按需加载）
   - 审查字体加载，确保使用 `next/font` 避免 FOIT（字体闪烁）
   - 分析打包产物 `npm run build --analyze`，优化 Chunk 体积
2. 后端与数据库：
   - Prisma 查询优化：检查所有存在 N+1 问题的查询，使用 `include` 或 `select`
   - 慢查询优化：为高频搜索字段、外键增加数据库索引
   - 接口性能调优：为非实时聚合接口增加 Redis 缓存

### 三、测试覆盖 (E2E)
使用 Playwright 编写并跑通以下核心链路测试：
1. `auth.spec.ts`：注册 → 登录 → 个人中心更新资料
2. `learning.spec.ts`：浏览课程列表 → 筛选 → 进入详情页 → 免费课程报名 → 观看视频 → 课时打勾
3. `shopping.spec.ts`：浏览商品 → 加入购物车 → 购物车调整数量 → 结算页 → 提交订单
4. `community.spec.ts`：进入社区 → 发布新帖 → 帖子评论 → 点赞
5. `admin.spec.ts`：管理员登录 → 进入用户管理 → 修改用户角色

### 四、SEO 与安全加固
1. SEO 优化：
   - 全局及各页面配置标准的 Metadata API（Title, Description, OpenGraph, Twitter 卡片）
   - 添加 Schema.org 结构化数据 (JSON-LD)：将 Course, Product, Article 注入对应页面
   - 动态生成 `sitemap.xml` 和 `robots.txt`
2. 安全加固（检查对照单）：
   - 确认无硬编码 API Key 在客户端代码中
   - CORS 策略配置正确的生产域名白名单
   - 开启 Helmet 中间件添加安全响应头
   - 确认所有接口请求的 Rate Limit 生效
   - 确认文件上传类型严格校验及重命名机制已实施

### 五、生产环境部署配置
1. Docker 构建：
   - 完善 `frontend/Dockerfile`（多阶段构建，仅保留 `.next/standalone` 和必要文件）
   - 完善 `backend/Dockerfile`（剔除 devDependencies，仅保留 `dist` 和 node_modules）
2. 容器编排：
   - `infra/docker-compose.prod.yml` 组装前后端及数据库/中间件容器
   - `infra/nginx/nginx.conf` 反向代理配置，配置 SSL 证书路径，启用 Gzip，配置静态资源缓存控制
3. CI/CD：
   - GitHub Actions 流水线，监听 `main` 分支 push
   - 前后端分离的 Job 执行：Lint -> Test -> Build -> Docker Push -> SSH Deploy

### 六、文档总结与发布
1. 完善项目根目录 `README.md`（项目介绍、演示截图、快速启动指南）
2. 更新 API Swagger 在线文档注释
3. 检查并移除开发遗留的 `console.log`，清理无用依赖
4. 检查 `docs/18_ART_ASSET_BACKLOG.md`：能补齐的资源优先用 image_gen 生成；无法补齐的明确标记为上线前待办，且页面必须仍可用。

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 最终验收标准
- [ ] Lighthouse 评分：Performance ≥ 80, Accessibility ≥ 85, SEO ≥ 90
- [ ] 所有 E2E 测试用例在本地运行通过
- [ ] Docker Compose 可以一键无错拉起全套生产环境
- [ ] 代码库中不包含任何敏感密钥、硬编码密码
- [ ] 项目 README 完善，架构图清晰
```
