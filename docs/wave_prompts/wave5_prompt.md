# Wave 5 开发提示词 — 社区与 AI

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 5 — 社区与 AI
# 前置完成：Wave 1-4

## 你的角色
你是全栈工程师，本 Wave 实现社区互动和 AI 智能服务。

## 必读规范
- docs/02_DATA_MODELS.md — Post/Comment/AiModelConfig 模型
- docs/03_API_SPECIFICATION.md — 社区 + AI 模块 API
- docs/06_AI_SERVICE_DESIGN.md — AI 架构设计（必读）
- docs/08_COMPONENT_SPEC.md — AIChatWidget 组件
- docs/10_REALTIME_DESIGN.md — WebSocket 实时通信
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 5 完整任务

### 一、后端 — 社区与通知
1. Post Module: 帖子 CRUD，支持分类（讨论/展示/提问/教程/挑战），标签管理
2. Comment Module: 复用 Wave 3 评论模块，支持帖子评论
3. 点赞系统: 复用 Wave 3 Favorite 机制
4. Notification Module: 通知 CRUD + 标记已读/全部已读
5. WebSocket Gateway: 实时推送新通知（如被评论、被点赞、系统通知），客户端连接加入 `user:{userId}` 房间
6. BullMQ: 邮件通知异步发送

### 二、后端 — AI 服务（参照 docs/06_AI_SERVICE_DESIGN.md）
1. AI 架构搭建:
   - BaseAIProvider 抽象基类
   - OpenAICompatProvider 实现（流式解析支持 DeepSeek/Qwen/GLM 等）
   - ImageGenProvider 实现（调用文生图 API 生成纹样）
   - AIConfigService: 从 DB 读取配置并使用 Redis 缓存
2. AI 聊天 API (`POST /api/v1/ai/chat`):
   - 支持 SSE 流式响应
   - 系统 Prompt: 皮雕学习助手角色，结合当前页面上下文
   - Redis 存储对话历史上下文（滑动窗口，TTL: 30min）
3. AI 纹样生成 (`POST /api/v1/ai/pattern/generate`):
   - 处理描述 + 风格参数(zhuangjin/yaozu/karst/modern)
   - 生成图片后自动上传至 MinIO 存储
4. 推荐系统 API (`POST /api/v1/ai/recommend/*`):
   - 课程/商品推荐逻辑

### 三、前端 — 社区
1. /community — 社区首页
   - 话题广场 Tab 切换（全部/讨论/展示/提问/教程/挑战）
   - 瀑布流或图文列表展示帖子
   - 热门话题侧栏
   - 悬浮发帖按钮（FAB）
2. /community/[id] — 帖子详情页
   - 内容展示（Markdown 渲染）+ 图片灯箱
   - 评论区 + 点赞 + 分享
3. 发帖 Modal / 页面
   - 选择分类 → 标题 → 内容（富文本/Markdown）→ 图片上传 → 标签选择
4. 挑战打卡功能（针对"挑战"分类帖子，记录用户连续打卡天数）

### 四、前端 — AI 与通知
1. AIChatWidget 组件（全局可调用）
   - 悬浮模式：右下角气泡，点击展开聊天面板
   - 内联模式：嵌入在学习播放页等特定区域
   - SSE 流式打字效果渲染（使用 ReadableStream 消费）
   - 自动获取当前页面内容作为 Context 传给后端
2. /create/pattern — AI 纹样生成体验页
   - 输入描述 + 选择风格(壮锦/瑶族等)
   - 生成中的骨架屏或进度动画
   - 结果展示 + 预览大图 + 下载/保存到我的素材
3. 通知系统
   - Header 铃铛图标 + 未读数字 Badge
   - 点击下拉显示最近通知列表
   - WebSocket 实时接收新通知（显示 Toast 提示）
   - /notifications 完整通知页

### 五、页面设计与美术资源
1. 社区首页、帖子详情、发帖编辑器、AI 助手、AI 纹样生成、通知中心统一参考 `docs/page-designs/images/04-community-ai-pages.png`。
2. 学习播放页的 AI 助手入口应与 `04-community-ai-pages.png` 的 AI 对话样式统一，并与 Wave 2 学习页组合。
3. 社区帖子图片、用户头像、AI 纹样结果、纹样示例必须保持同一非遗皮雕视觉语言。
4. 若缺帖子图、头像、纹样示例图，优先使用 image_gen 按 `docs/page-designs/README.md` 生成。
5. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 使用占位图并登记缺口，继续完成社区、通知、SSE 流式对话和推荐逻辑。

### 六、技术要点
- AI 对话必须使用 SSE (Server-Sent Events) 实现真正的流式打字体验
- 避免 AI 调用超时，Next.js 调用 AI 路由如果放在 API Route，需配置 Edge Runtime 或延长 timeout
- WebSocket 使用 Socket.IO，前后端鉴权复用 JWT
- 帖子内容渲染使用 `react-markdown`，并防止 XSS（配置 `remark-gfm` 等）

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档：
- 新增/修改 API → 更新 docs/03_API_SPECIFICATION.md
- 新增/修改数据模型 → 更新 docs/02_DATA_MODELS.md
- 新增/修改组件 → 更新 docs/08_COMPONENT_SPEC.md
- 完成 Wave → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
