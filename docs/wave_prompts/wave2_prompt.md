# Wave 2 开发提示词 — 教学核心

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis + MinIO + Meilisearch
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 2 — 教学核心
# 前置完成：Wave 1（项目骨架 + 认证 + 设计系统 + 基础UI）

## 你的角色
你是全栈工程师，继续开发「艺育皮韵」平台。本 Wave 聚焦教学系统核心功能。

## 必读规范
- docs/02_DATA_MODELS.md — Course/Chapter/Lesson/Enrollment 模型
- docs/03_API_SPECIFICATION.md — 课程模块 API
- docs/08_COMPONENT_SPEC.md — CourseCard, VideoPlayer, LearningPanel 组件
- docs/11_STORAGE_DESIGN.md — 视频上传与处理
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 2 完整任务

### 一、后端 — 课程系统
1. Course Module: 课程 CRUD（创建/更新/删除/列表/详情），支持筛选：级别/分类/关键词/免费，排序：最新/最热/评分/价格
2. Chapter + Lesson: 嵌套 CRUD，拖拽排序（sortOrder 字段），支持视频/图文/附件课时类型
3. Enrollment: 报名课程 + 检查访问权限（免费课直接报名，付费课需购买）
4. LessonProgress: 学习进度记录（视频播放位置、完成状态），防抖接收（每 10 秒上报一次）
5. Storage Module: MinIO 集成 + 图片上传（Sharp 压缩/裁切/WebP）+ 视频上传（大文件分片）
6. Search Module: Meilisearch 集成，课程索引自动同步（新增/更新/删除时触发）
7. Review Module: 课程评价 CRUD + 评分统计（平均分、各星级占比）
8. 教师只能编辑/删除自己的课程（OwnerGuard）

### 二、前端 — 课程页面
1. /courses — 课程列表页（SSG+ISR, revalidate=60s）
   - 筛选侧栏：级别（入门/进阶/精通）、分类、免费/付费、关键词搜索
   - 排序切换：最新/最热/评分最高/价格
   - CourseCard 组件（垂直布局：封面16:9 → 标题 → 教师 → 价格/级别，Hover 封面放大1.05+阴影增强）
   - 分页 / 无限滚动
2. /courses/[slug] — 课程详情页（SSR，SEO 友好）
   - 课程 Hero：封面大图 + 标题/副标题 + 评分 + 学员数 + 价格
   - 章节大纲（可折叠手风琴），标记免费试看课时
   - 教师信息卡片（头像/简介/课程数）
   - 评价区（评分统计 + 评价列表 + 分页）
   - 报名/购买 CTA 按钮
3. /learn/[courseId]/[lessonId] — 学习播放页（需已报名，CSR）
   - VideoPlayer 组件：播放/暂停/进度条/倍速(0.5x~2x)/全屏/画中画
   - 左区：视频 + 课时文字内容/附件
   - 右区：章节导航大纲（当前课时高亮，完成打勾），可折叠
   - 自动记录播放进度，下次进入自动续播
   - 完成课时自动跳转下一课时
   - AI 助手入口按钮（链接到 Wave 5）
4. /my-courses — 我的课程列表（进度条显示完成百分比）
5. /teacher/dashboard — 教师数据概览（课程数、学员数、评分摘要）
6. /teacher/courses — 教师课程管理列表
7. /teacher/courses/[id]/edit — 课程编辑器
   - 多步表单：基本信息（标题/描述/分类/封面） → 章节课时管理（拖拽排序）→ 定价 → 预览发布
   - 富文本编辑器（课程描述）
   - 视频上传进度条

### 三、页面设计与美术资源
1. 课程列表、课程详情参考 `docs/page-designs/images/01-public-pages.png`。
2. 我的课程参考 `docs/page-designs/images/02-learner-auth-dashboard.png`。
3. 教师面板、课程管理、课程编辑器参考 `docs/page-designs/images/05-teacher-pages.png`。
4. 所有课程封面、教师头像、课程详情 Hero 图必须使用统一皮革暖色、匠人工坊光影、壮锦纹样点缀的资源风格。
5. 若缺课程封面、教师头像或视频封面，优先使用 image_gen 按 `docs/page-designs/README.md` 生成。
6. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 使用占位图并登记缺口，继续完成 API、页面结构、交互和测试。

### 四、技术要点
- 课程列表使用 SWR + 分页（保持 URL 查询参数同步）
- 课程详情使用 generateStaticParams + revalidate ISR
- 视频播放器封装 HTML5 Video API（不用第三方播放器库）
- 进度记录防抖：前端每 10 秒发送一次进度，避免频繁请求
- 教师操作使用 OwnerGuard 验证资源所有权
- 搜索使用 Meilisearch 全文索引（比数据库 LIKE 快 100x）

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档：
- 新增/修改 API → 更新 docs/03_API_SPECIFICATION.md
- 新增/修改数据模型 → 更新 docs/02_DATA_MODELS.md
- 新增/修改组件 → 更新 docs/08_COMPONENT_SPEC.md
- 完成 Wave → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
