# 页面设计图与前端实现索引 | 艺育皮韵

> 本目录保存页面设计图、页面到设计图的映射、统一视觉母版与美术资源生成规范。前端实现时应先阅读 `docs/04_UI_DESIGN_SYSTEM.md`、`docs/07_PAGE_ROUTES.md`，再按本文档定位设计图。若 image_gen 不可用，按 `docs/18_ART_ASSET_BACKLOG.md` 占位并登记资源缺口。

---

## 一、设计图清单

| 文件 | 覆盖页面 | 说明 |
|------|----------|------|
| `images/01-public-pages.png` | 首页、课程列表、课程详情、作品画廊、作品详情、非遗地图 | 公开访问页面母版，重点定义主导航、Hero、卡片、瀑布流、地图与详情页结构 |
| `images/02-learner-auth-dashboard.png` | 登录、注册、忘记密码、我的课程、我的作品、个人中心、发布作品 | 认证页与学员工作台母版，重点定义表单、私有侧栏、进度卡、上传表单 |
| `images/03-shop-order-pages.png` | 商城首页、商品详情、分类浏览、购物车、结算页、我的订单、订单详情/支付状态 | 电商闭环母版，重点定义商品卡、规格选择、订单状态、结算流程 |
| `images/04-community-ai-pages.png` | 社区首页、帖子详情、发帖编辑器、AI 学习助手、AI 纹样生成、通知中心、纹样素材库 | 社区与 AI 母版，重点定义动态流、评论区、AI 对话、纹样生成结果 |
| `images/05-teacher-pages.png` | 教师面板、课程管理、创建课程、编辑课程、学员管理、收入统计、上传处理队列 | 教师后台母版，重点定义高信息密度列表、表格、图表、多步编辑器 |

图片分辨率均为 `1536 x 1024`，用于产品方向、布局、视觉语言与资源风格参考。实现时不要求像素级复刻，但必须保持统一的信息层级、色彩、材质与组件行为。

---

## 二、统一视觉母版

### 2.1 品牌气质

艺育皮韵的页面统一采用“皮革质感 x 壮锦纹样 x 匠人暖光”的视觉体系。整体应像一个现代、克制、可信的非遗教育产品，而不是营销页集合。

- 页面底色使用 `--lc-bg` 暖白，内容区域使用 `--lc-bg-secondary` 或白色半透明层。
- 主操作使用 `--lc-primary`，购买、报名、提交等强 CTA 使用 `--lc-accent`。
- 装饰色仅用于徽章、分割线、认证印章、地图标记和少量重点数据，不应铺满大面积渐变。
- 所有页面统一使用同一套 Header、Dashboard Sidebar、Teacher/Admin Sidebar、Card、Button、Input、Tag、Badge、Modal。
- 皮革纹理作为低透明度背景叠加，不应影响文字可读性。
- 壮锦纹样用于 Hero 边框、页脚、卡片角标、空状态插图底纹，不应抢占主要内容。

### 2.2 布局规则

- 公开页：顶部统一 `SiteHeader`，最大内容宽度 `1280px`，Hero 后必须露出下一屏内容。
- 私有页：左侧统一 `SiteSidebar`，顶部保留搜索、通知和头像菜单。
- 教师/后台页：侧栏宽度、表格密度、筛选器样式保持一致，优先信息扫描效率。
- 列表页：顶部为标题、说明、筛选和搜索；主体使用卡片网格、瀑布流或表格。
- 详情页：左侧或上方承载主媒体，右侧/下方承载元信息、操作、章节、评价、故事。
- 表单页：多步流程使用顶部步骤条；上传区、标签、富文本和提交区布局一致。

### 2.3 组件观感

- 卡片圆角遵循 `--lc-radius-md` 到 `--lc-radius-lg`，后台表格容器可使用更小圆角。
- 重要图片保持真实皮雕材质：皮料纹理、刻刀、压花、染色、缝线和木质工坊环境。
- 按钮内图标优先使用 Lucide React；皮雕工具类图标可以使用自定义 SVG。
- 表单边框、输入焦点、错误状态严格遵循 `docs/04_UI_DESIGN_SYSTEM.md`。
- 页面中不得出现与项目无关的霓虹渐变、大面积紫蓝渐变、漂浮光球、卡通插画或通用 stock 风。

---

## 三、页面实现索引

| 路由 | 页面 | 设计图 | 实现重点 |
|------|------|--------|----------|
| `/` | 首页 | `01-public-pages.png` | 工坊皮雕 Hero、四大价值入口、最新课程、作品精选、非遗地图入口 |
| `/courses` | 课程列表 | `01-public-pages.png` | 搜索、级别/分类/价格筛选、CourseCard 网格、分页 |
| `/courses/[slug]` | 课程详情 | `01-public-pages.png` | 课程封面、报名 CTA、章节目录、教师档案、评价摘要 |
| `/gallery` | 作品画廊 | `01-public-pages.png` | Masonry 瀑布流、类别筛选、ArtworkCard hover 元信息 |
| `/gallery/[id]` | 作品详情 | `01-public-pages.png` | 大图预览、作者、创作故事、材料技法、评论 |
| `/heritage-map` | 非遗地图 | `01-public-pages.png` | 广西地图、基地 pin、路线卡、图例 |
| `/login` | 登录 | `02-learner-auth-dashboard.png` | 皮雕视觉背景、紧凑表单、记住登录、第三方登录入口 |
| `/register` | 注册 | `02-learner-auth-dashboard.png` | 手机/邮箱注册、验证码、服务协议、登录跳转 |
| `/forgot-password` | 忘记密码 | `02-learner-auth-dashboard.png` | 三步找回流程、验证码、重置密码状态 |
| `/my-courses` | 我的课程 | `02-learner-auth-dashboard.png` | 课程进度卡、继续学习、学习成就、证书入口 |
| `/my-artworks` | 我的作品 | `02-learner-auth-dashboard.png` | 作品状态筛选、统计、发布入口、审核状态 |
| `/profile` | 个人中心 | `02-learner-auth-dashboard.png` | 头像、角色徽章、资料编辑、统计数据 |
| `/create/artwork` | 发布作品 | `02-learner-auth-dashboard.png` | 多图上传、技法/材料标签、创作故事、多步提交 |
| `/shop` | 商城首页 | `03-shop-order-pages.png` | 分类入口、广西非遗徽章、商品推荐、活动 Banner |
| `/shop/[slug]` | 商品详情 | `03-shop-order-pages.png` | 多图、规格、库存、价格、评价、购买 CTA |
| `/shop/categories` | 分类浏览 | `03-shop-order-pages.png` | 分类树、筛选排序、商品网格 |
| `/cart` | 购物车 | `03-shop-order-pages.png` | 数量步进器、商品快照、总价、结算 CTA |
| `/checkout` | 结算页 | `03-shop-order-pages.png` | 地址、订单确认、支付方式、备注 |
| `/my-orders` | 我的订单 | `03-shop-order-pages.png` | 状态 tabs、订单卡片、支付/取消/确认收货 |
| `/community` | 社区首页 | `04-community-ai-pages.png` | 话题 tabs、挑战 Banner、帖子流、热门标签 |
| `/community/[id]` | 帖子详情 | `04-community-ai-pages.png` | 作者、正文、多图、点赞、评论和回复 |
| `/create/post` | 发帖编辑 | `04-community-ai-pages.png` | 类型选择、富文本、图片、标签、发布校验 |
| `/create/pattern` | AI 纹样生成 | `04-community-ai-pages.png` | Prompt、风格选择、生成结果、保存/下载 |
| `/notifications` | 通知中心 | `04-community-ai-pages.png` | 已读/未读、实时状态、按类型筛选 |
| `/learn/[courseId]/[lessonId]` | 学习播放 | `04-community-ai-pages.png` + `01-public-pages.png` | 视频播放器、章节大纲、笔记、AI 助手内嵌；使用课程详情的章节样式和 AI 对话样式组合 |
| `/teacher/dashboard` | 教师面板 | `05-teacher-pages.png` | KPI、课程表现、待处理事项、图表 |
| `/teacher/courses` | 课程管理 | `05-teacher-pages.png` | 状态筛选、列表/表格、发布状态、快捷操作 |
| `/teacher/courses/[id]/edit` | 编辑课程 | `05-teacher-pages.png` | 章节/课时编辑器、视频上传、预览、发布流程 |
| `/teacher/students` | 学员管理 | `05-teacher-pages.png` | 学员进度、作业点评、私信/提醒 |
| `/admin/dashboard` | 管理仪表盘 | `05-teacher-pages.png` | 沿用后台信息密度，替换为平台总 KPI、增长图、收入图 |
| `/admin/users` | 用户管理 | `05-teacher-pages.png` | 管理表格、角色筛选、封禁/解封、审核记录 |
| `/admin/content` | 内容审核 | `05-teacher-pages.png` | 审核队列、预览、通过/驳回原因 |
| `/admin/shop` | 商城管理 | `05-teacher-pages.png` + `03-shop-order-pages.png` | 商品/订单表格与商品卡视觉结合 |
| `/admin/finance` | 财务管理 | `05-teacher-pages.png` | 收入统计、结算表、导出 |
| `/admin/system` | 系统配置 | `05-teacher-pages.png` | Banner、邮件、系统参数分组表单 |
| `/admin/ai-config` | AI 配置 | `04-community-ai-pages.png` + `05-teacher-pages.png` | 模型配置表、能力标签、测试对话区 |

---

## 四、美术资源规范

### 4.1 必备资源类型

| 类型 | 用途 | 建议尺寸 |
|------|------|----------|
| 皮雕工坊 Hero 图 | 首页、认证页、课程详情 | `1920x1080` 或 `1600x900` |
| 课程封面 | CourseCard、课程详情、学习页 | `1200x675` |
| 作品图 | 画廊、作品详情、我的作品 | 长边 `1600px`，保留多比例 |
| 商品图 | 商品卡、商品详情、购物车/订单快照 | `1200x1200` 和 `1200x900` |
| 用户头像 | 教师、学员、商家、评论 | `512x512` |
| 壮锦/瑶族/喀斯特纹样 | 装饰边框、纹样素材库、AI 生成结果 | `1024x1024` |
| 皮革纹理 | 卡片与区块低透明度叠加 | `1024x1024` 无缝纹理 |
| 工具图鉴 | 工具百科、课程辅助图 | `1200x900` |

### 4.2 缺素材时的处理原则

如果实现页面时缺少真实美术资源，必须使用 image_gen 生成项目内可引用的临时素材，不要使用随机占位图、外链热链图片或与皮雕无关的 stock 图。

如果 image_gen 暂时无法使用，不要阻塞页面开发。请按 `docs/18_ART_ASSET_BACKLOG.md` 使用项目内占位资源，保持最终尺寸比例和布局稳定，并登记待补资源。

生成后应保存到前端静态资源目录，例如：

```text
frontend/public/images/generated/
  hero-workshop.png
  courses/
  artworks/
  products/
  avatars/
  patterns/
  textures/
```

文档阶段的设计图保存在：

```text
docs/page-designs/images/
```

### 4.3 image_gen 统一提示词模板

生成新素材时，必须复用以下风格锁定词，保证所有页面风格统一：

```text
Generate a premium realistic visual asset for “艺育皮韵”, a Chinese intangible-cultural-heritage leather carving education platform.
Style: warm leather brown #B5651D, deep brown #2D1B0E, warm workshop light, cinnabar accent #C84B31, subtle Zhuang brocade gold #D4A853.
Subject: <替换为具体素材，例如 leather carving course cover / Guangxi motif carved wallet / Chinese craft teacher avatar>.
Texture: real leather grain, hand-carved embossing, stitching, carving tools, refined craft photography.
Mood: elegant, restrained, heritage craft, modern educational product.
Avoid: cartoon style, neon gradients, purple-blue dominance, decorative blobs, generic stock-photo look, unreadable text, watermarks.
```

示例：

```text
Generate a 1200x675 realistic course cover for “艺育皮韵”.
Subject: a Chinese craftsperson carving a peony pattern into warm brown leather on a wooden workbench, leather knives and stamping tools nearby.
Style: warm leather brown #B5651D, deep brown #2D1B0E, warm workshop light, subtle Zhuang brocade gold accent.
Mood: elegant heritage craft education, premium but usable.
Avoid: cartoon style, neon gradients, watermark, text overlay.
```

### 4.4 版权与替换

- AI 生成素材仅作为开发期和原型期资源，生产上线前应由项目方确认版权、肖像权和非遗图案使用边界。
- 真实传承人头像、真实作品、课程视频封面必须使用已授权素材替换。
- 广西民族纹样应避免直接复制受限图案，建议转译为原创纹理与现代几何装饰。

---

## 五、前端构建备注

- 只使用 Vanilla CSS、CSS Modules 和全局 CSS Variables，不使用 Tailwind CSS。
- 设计图中的图片、头像、商品、作品和纹样均可先作为 mock 数据资源接入。
- 实现页面时优先拆分共享组件：`SiteHeader`、`SiteSidebar`、`PageHero`、`CourseCard`、`ArtworkCard`、`ProductCard`、`AIChatWidget`、`PatternGallery`。
- 后台页面不要做成营销页，应保持表格、筛选器、图表、批量操作和状态标签的工作台风格。
- 移动端应保留同一视觉语言，但采用单列卡片、抽屉导航、底部重点 CTA。
