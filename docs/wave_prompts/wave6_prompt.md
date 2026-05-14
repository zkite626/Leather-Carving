# Wave 6 开发提示词 — 管理后台

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 6 — 管理后台
# 前置完成：Wave 1-5

## 你的角色
你是全栈工程师，本 Wave 实现完整管理后台系统。

## 必读规范
- docs/03_API_SPECIFICATION.md — 管理后台 API
- docs/07_PAGE_ROUTES.md — 管理后台路由
- docs/12_TESTING_STRATEGY.md — Wave 6 验收标准
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 6 完整任务

### 一、后端 — 管理 API 与统计服务
1. Admin Module - 仪表盘数据 API:
   - 聚合统计数据：用户总数、课程总数、订单总数、总收入
   - 趋势图表数据（日/周/月）
   - 定时任务 `@Cron` 每日凌晨预计算统计数据并缓存到 Redis
2. 用户管理 API: 列表查询(分页/搜索/筛选)、角色变更、封禁/解封
3. 内容审核 API: 课程/作品/帖子审核队列，支持批量通过/驳回
4. 商城管理 API: 订单列表查询、物流状态更新、分类树管理
5. 财务管理 API: 收入流水查询、商家结算记录
6. Banner 管理 API: 首页/商城轮播图 CRUD
7. 系统配置 API:
   - AI 模型配置 CRUD + 测试连通性
   - 邮件配置 SMTP CRUD + 测试发送
8. 审计日志: 拦截器或服务内记录所有管理员敏感操作（时间、操作人、IP、内容）

### 二、前端 — 后台系统
1. 管理后台专属 Layout (`/admin/*`)
   - 左侧导航菜单（带图标、当前高亮、可折叠）
   - 顶部 Header（面包屑导航、全屏切换、用户菜单）
   - 必须通过全局 `AdminGuard` 拦截，非管理员自动跳回首页
2. /admin/dashboard — 数据仪表盘
   - 顶栏数据卡片（带环比增长箭头，绿涨红跌）
   - 图表区：近 30 天用户增长/收入趋势折线图（Recharts / Chart.js）
   - 排名区：课程报名 TOP 10 柱状图
   - 动态区：近期系统活动流水
3. /admin/users — 用户管理
   - 表格展示：头像、昵称、邮箱、角色、状态、注册时间
   - 复杂筛选：状态过滤、角色过滤、搜索框
   - 操作：修改角色（下拉框）、封禁/解封（需二次确认弹窗）
4. /admin/content — 内容审核
   - Tab 切换：待审核 / 已通过 / 已驳回
   - 审核预览卡片/抽屉，展示课程/作品/帖子详细内容
   - 操作：通过按钮 / 驳回按钮（需填写驳回原因弹窗）
5. /admin/shop — 商城与订单管理
   - 商品管理子页
   - 订单处理子页（状态更新为已发货等）
   - 分类拖拽排序管理
6. /admin/finance — 财务流水
   - 收入统计分析图表
   - 交易流水明细表格（支持导出 CSV）
7. /admin/system — 系统设置
   - Banner 配置页：图片上传、排序、跳转链接、有效期
   - AI 模型配置页：列表展示、表单（Provider、API Key 密码框、Base URL）、启用开关、连通性测试按钮
   - 邮件配置页
8. /admin/audit-log — 审计日志
   - 表格/时间线展示
   - 筛选：操作类型、管理员、时间范围
   - 点击展开查看 JSON Request Body 差异

### 三、页面设计与美术资源
1. 管理后台整体参考 `docs/page-designs/images/05-teacher-pages.png`，延展为更高信息密度的管理系统。
2. 商城管理可结合 `docs/page-designs/images/03-shop-order-pages.png` 的商品/订单视觉；AI 配置可结合 `docs/page-designs/images/04-community-ai-pages.png` 的 AI 组件视觉。
3. 后台侧栏、Header、表格、筛选器、图表、状态标签、二次确认弹窗必须统一组件化。
4. 缺 Banner 图、审核预览图、配置页示例图时，优先使用 image_gen 按 `docs/page-designs/README.md` 生成。
5. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 使用占位图并登记缺口，继续完成后台 CRUD、审核、统计和权限逻辑。

### 四、技术要点
- 管理后台图表建议使用轻量级库如 `recharts`。
- 表格组件需封装通用能力：分页（基于后端）、排序、本地/远程搜索。
- 所有管理操作按钮（删除、驳回、封禁）必须加入二次确认交互，防止误操作。
- 审计日志在后端可借助 Prisma Middleware 或 NestJS Interceptor 统一拦截处理，减少侵入。

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档：
- 新增/修改 API → 更新 docs/03_API_SPECIFICATION.md
- 新增/修改数据模型 → 更新 docs/02_DATA_MODELS.md
- 新增/修改组件 → 更新 docs/08_COMPONENT_SPEC.md
- 完成 Wave → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
