# 03 — API 接口规格 | 艺育皮韵

> 所有 REST API 端点的 Request/Response 规格。NestJS 使用 Swagger/OpenAPI 3.1 自动生成在线文档。

---

## 一、全局约定

| 项目 | 约定 |
|------|------|
| Base URL | `/api/v1` |
| 认证 | Bearer Token（JWT）via `Authorization` Header |
| Content-Type | `application/json`（文件上传为 `multipart/form-data`） |
| 分页 | `?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc` |
| 错误码 | HTTP 状态码 + 业务错误码 |
| 时间格式 | ISO 8601（`2026-01-01T00:00:00.000Z`） |

---

## 二、认证模块 `/api/v1/auth`

### POST `/auth/register` — 注册

```yaml
Request:
  body:
    email: string (required, email format)
    password: string (required, min 8)
    nickname: string (required, 2-20 chars)
    phone?: string
Response 201:
  data:
    user: { id, email, nickname, role }
    accessToken: string
    refreshToken: string
Errors: 409 邮箱已注册
```

### POST `/auth/login` — 登录

```yaml
Request:
  body:
    email: string (required)
    password: string (required)
Response 200:
  data:
    user: { id, email, nickname, avatar, role }
    accessToken: string (expires 2h)
    refreshToken: string (expires 7d)
Errors: 401 邮箱或密码错误
```

### POST `/auth/refresh` — 刷新令牌

```yaml
Request:
  body:
    refreshToken: string (required)
Response 200:
  data:
    accessToken: string
    refreshToken: string
Errors: 401 令牌无效/已过期
```

### POST `/auth/logout` — 登出

```yaml
Headers: Authorization: Bearer <token>
Response 200:
  data: null
```

### POST `/auth/forgot-password` — 忘记密码

```yaml
Request:
  body:
    email: string (required)
Response 200:
  message: "验证码已发送"
```

### POST `/auth/reset-password` — 重置密码

```yaml
Request:
  body:
    email: string (required)
    code: string (required, 6位)
    newPassword: string (required)
Response 200:
  message: "密码重置成功"
```

---

## 三、用户模块 `/api/v1/users`

### GET `/users/me` — 获取当前用户信息 🔒

```yaml
Response 200:
  data: { id, email, nickname, avatar, bio, role, status, createdAt }
```

### PATCH `/users/me` — 更新个人信息 🔒

```yaml
Request:
  body:
    nickname?: string
    avatar?: string
    bio?: string
    phone?: string
Response 200:
  data: User
```

### GET `/users/:id/profile` — 获取用户公开资料

```yaml
Response 200:
  data: { id, nickname, avatar, bio, role, artworkCount, courseCount }
```

---

## 四、课程模块 `/api/v1/courses`

### GET `/courses` — 课程列表（支持筛选）

```yaml
Query:
  page?: number (default 1)
  pageSize?: number (default 20)
  level?: CourseLevel
  category?: string
  isFree?: boolean
  keyword?: string
  sortBy?: 'createdAt' | 'enrollCount' | 'rating' | 'price'
Response 200: PaginatedResponse<ICourse>
```

### GET `/courses/:slug` — 课程详情

```yaml
Response 200:
  data: ICourse & {
    chapters: Array<{
      id, title, sortOrder,
      lessons: Array<{ id, title, type, duration, isFreePreview }>
    }>
    teacher: TeacherProfile
    reviewSummary: { average, count, distribution }
  }
```

### POST `/courses` — 创建课程 🔒 TEACHER

```yaml
Request:
  body:
    title: string (required)
    subtitle?: string
    description?: string
    level: CourseLevel (required)
    category?: string
    tags?: string[]
    price?: number (default 0)
    isFree?: boolean
Response 201: data: ICourse
```

### PATCH `/courses/:id` — 更新课程 🔒 TEACHER(owner)

```yaml
Request:
  body: Partial<CreateCourseDto>
Response 200: data: ICourse
```

### DELETE `/courses/:id` — 删除课程 🔒 TEACHER(owner)

```yaml
Response 200: { message: "Course deleted" }
```

### POST `/courses/:id/publish` — 发布课程 🔒 TEACHER(owner)

```yaml
Response 200: data: ICourse
Errors: 400 课程无章节不可发布
```

### GET `/courses/my` — 教师自己的课程列表 🔒 TEACHER

```yaml
Query: page?, pageSize?, keyword?
Response 200: PaginatedResponse<ICourse>
```

### GET `/courses/dashboard` — 教师数据概览 🔒 TEACHER

```yaml
Response 200:
  data: { totalCourses, publishedCourses, totalStudents, avgRating, recentEnrollments }
```

### GET `/courses/:id/enrollment` — 获取报名状态 🔒

```yaml
Response 200: data: IEnrollment | null
```

### GET `/courses/:id/progress` — 获取课程学习进度 🔒

```yaml
Response 200: data: IEnrollment & { lessonProgresses: ILessonProgress[] } | null
```

### POST `/courses/:id/chapters` — 添加章节 🔒 TEACHER

```yaml
Request:
  body:
    title: string (required)
    sortOrder?: number
Response 201: data: IChapter
```

### PATCH `/courses/chapters/:chapterId` — 更新章节 🔒 TEACHER(owner)

### DELETE `/courses/chapters/:chapterId` — 删除章节 🔒 TEACHER(owner)

### POST `/courses/:id/chapters/reorder` — 章节排序 🔒 TEACHER(owner)

```yaml
Request:
  body:
    chapterIds: string[] (required, 排序后的 ID 列表)
Response 200: { message: "Chapters reordered" }
```

### POST `/courses/chapters/:chapterId/lessons` — 添加课时 🔒 TEACHER

```yaml
Request:
  body:
    title: string (required)
    type: LessonType (required)
    content?: string
    videoUrl?: string
    duration?: number
    isFreePreview?: boolean
    sortOrder?: number
Response 201: data: ILesson
```

### PATCH `/courses/lessons/:lessonId` — 更新课时 🔒 TEACHER(owner)

### DELETE `/courses/lessons/:lessonId` — 删除课时 🔒 TEACHER(owner)

### POST `/courses/chapters/:chapterId/lessons/reorder` — 课时排序 🔒 TEACHER(owner)

### POST `/courses/:id/enroll` — 报名课程 🔒

```yaml
Response 201:
  data: { enrollmentId, courseId, status }
Errors: 409 已报名 | 402 需付费
```

### POST `/lessons/:id/progress` — 更新学习进度 🔒

```yaml
Request:
  body:
    watchedDuration: number
    lastPosition: number
    isCompleted?: boolean
Response 200: data: LessonProgress
```

---

## 五、作品模块 `/api/v1/artworks`

### GET `/artworks` — 作品画廊

```yaml
Query:
  page?, pageSize?, category?, keyword?, techniques? (逗号分隔), sortBy?: 'createdAt'|'likeCount'|'viewCount'
Response 200: PaginatedResponse<IArtwork>
```

### GET `/artworks/:id` — 作品详情 (自动 +1 浏览量)

```yaml
Response 200: data: IArtwork (含 images, comments 嵌套 3 层)
```

### GET `/artworks/:id/related` — 相关作品

```yaml
Response 200: data: IArtwork[] (同技法/同作者，limit 6)
```

### GET `/artworks/my` — 我的作品 🔒

```yaml
Query: page?, pageSize?
Response 200: PaginatedResponse<IArtwork> (含所有状态)
```

### POST `/artworks` — 创建作品 🔒

```yaml
Request: application/json
  title: string (required, max 200)
  description?: string
  category?: string
  techniques?: string[]
  materials?: string[]
  tags?: string[]
  story?: string
Response 201: data: IArtwork
```

### POST `/artworks/:id/images` — 添加图片 🔒

```yaml
Request:
  body: { imageUrls: string[] } (总上限 9 张)
Response 201: data: IArtworkImage[] (首张自动设为封面)
```

### PATCH `/artworks/:id/images/reorder` — 重排序图片 🔒

```yaml
Request:
  body: { imageIds: string[] } (按新顺序)
```

### POST `/artworks/:id/images/:imageId/cover` — 设为封面 🔒

### DELETE `/artworks/:id/images/:imageId` — 删除图片 🔒

### POST `/artworks/:id/submit` — 提交审核 🔒

```yaml
说明: DRAFT/REJECTED → REVIEWING
```

### PATCH `/artworks/:id` — 更新作品 🔒

### DELETE `/artworks/:id` — 删除作品(软删除) 🔒

### 评论与收藏（通用）

见下方「评论模块」和「收藏模块」。

---

## 五-b、评论模块 `/api/v1/comments`

### GET `/comments/artworks/:artworkId` — 作品评论列表

```yaml
Query: page?, pageSize?
Response 200: PaginatedResponse<IComment> (嵌套 3 层)
```

### POST `/comments/artworks/:artworkId` — 评论作品 🔒

```yaml
Request:
  body:
    content: string (required, 1-1000)
    parentId?: string (回复某条评论，最深 3 层)
Response 201: data: IComment
Errors: 400 超过最大回复深度
```

### GET `/comments/posts/:postId` — 帖子评论列表

### POST `/comments/posts/:postId` — 评论帖子 🔒

### DELETE `/comments/:id` — 删除评论 🔒 (owner)

---

## 五-c、收藏模块 `/api/v1/favorites`

### POST `/favorites/:entityType/:entityId` — 切换收藏（幂等）🔒

```yaml
Path:
  entityType: 'artwork' | 'course' | 'post'
Response 200: data: { favorited: boolean }
说明: 已收藏则取消，未收藏则添加。自动更新实体 likeCount。
```

### GET `/favorites/check/:entityType/:entityId` — 检查是否已收藏 🔒

### GET `/favorites/my` — 我的收藏列表 🔒

```yaml
Query: entityType?, page?, pageSize?
Response 200: PaginatedResponse<Favorite>
```

---

## 五-d、纹样素材库 `/api/v1/patterns`

### GET `/patterns` — 纹样列表

```yaml
Query: page?, pageSize?, category?, keyword?
Response 200: PaginatedResponse<IPatternAsset>
```

### GET `/patterns/:id` — 纹样详情

### POST `/patterns` — 创建纹样 🔒 ADMIN

### PATCH `/patterns/:id` — 更新纹样 🔒 ADMIN

### DELETE `/patterns/:id` — 删除纹样 🔒 ADMIN

### POST `/patterns/:id/download` — 下载计数 +1

---

## 六、商城模块 `/api/v1/shop`

### 商品管理

#### GET `/shop/products` — 商品列表

```yaml
Query:
  page?, pageSize?, categoryId?, isGuangxi?, minPrice?, maxPrice?,
  keyword?, sortBy?: 'price' | 'sales' | 'rating' | 'createdAt', sortOrder?, status?
Response 200: PaginatedResponse<IProduct>
```

#### GET `/shop/products/:slug` — 商品详情（含图片列表、分类、评价摘要）

#### GET `/shop/products/guangxi` — 广西特色商品（limit 8）

#### GET `/shop/products/hot` — 热销商品（按销量排序，limit 8）

#### GET `/shop/products/new` — 新品上架（按创建时间排序，limit 8）

#### GET `/shop/products/my` — 我的商品（商家）🔒

#### POST `/shop/products` — 创建商品 🔒

```yaml
Request:
  body:
    name: string, slug?: string, description?, categoryId: string,
    price: number, originalPrice?, stock?, stockAlert?,
    isGuangxi?, attributes?: Record<string,unknown>, tags?: string[]
```

#### PATCH `/shop/products/:id` — 更新商品 🔒

#### DELETE `/shop/products/:id` — 删除商品（软删除）🔒

#### POST `/shop/products/:id/images` — 添加商品图片（最多10张）🔒

#### PATCH `/shop/products/:id/images/reorder` — 重排商品图片 🔒

#### DELETE `/shop/products/:id/images/:imageId` — 删除商品图片 🔒

#### PATCH `/shop/products/:id/status` — 更新商品状态 🔒

### 分类管理

#### GET `/shop/categories` — 分类树

```yaml
Response 200:
  data: IProductCategory[] (嵌套树形，含 children 和 _count.products)
```

#### GET `/shop/categories/:id` — 分类详情

#### POST `/shop/categories` — 创建分类 🔒 ADMIN

#### PATCH `/shop/categories/:id` — 更新分类 🔒 ADMIN

#### DELETE `/shop/categories/:id` — 删除分类 🔒 ADMIN

### 购物车

#### POST `/shop/cart` — 添加到购物车 🔒

```yaml
Request:
  body:
    productId: string (required)
    quantity: number (1-99, default 1)
Response 201: data: CartItem
Constraints: 最多50种商品，库存校验，相同商品累加数量
```

#### GET `/shop/cart` — 获取购物车 🔒

#### GET `/shop/cart/count` — 购物车数量 🔒

#### PATCH `/shop/cart/:id` — 更新购物车数量 🔒

#### DELETE `/shop/cart/:id` — 删除购物车项 🔒

#### DELETE `/shop/cart` — 清空购物车 🔒

### 收货地址

#### GET `/shop/addresses` — 地址列表 🔒

#### GET `/shop/addresses/:id` — 地址详情 🔒

#### POST `/shop/addresses` — 创建地址 🔒（最多10个）

```yaml
Request:
  body:
    name: string, phone: string (手机号格式),
    province: string, city: string, district: string, detail: string,
    isDefault?: boolean
```

#### PATCH `/shop/addresses/:id` — 更新地址 🔒

#### DELETE `/shop/addresses/:id` — 删除地址 🔒

### 订单管理

#### POST `/shop/orders` — 创建订单 🔒

```yaml
Request:
  body:
    items: Array<{ productId: string, quantity: number }>
    address: { name, phone, province, city, district, detail }
    remark?: string
Response 201: data: IOrder
Errors: 400 库存不足 | 400 商品下架 | 400 版本冲突
技术: Prisma $transaction + 乐观锁 (version字段) 保证原子性
订单号: LCyyyyMMddXXXX 格式
```

#### GET `/shop/orders` — 我的订单列表 🔒

```yaml
Query:
  page?, pageSize?, status?: OrderStatus
```

#### GET `/shop/orders/:id` — 订单详情 🔒

#### POST `/shop/orders/:id/pay` — 支付订单 🔒（Mock 支付，直接标记已支付）

#### POST `/shop/orders/:id/cancel` — 取消订单 🔒（仅PENDING状态，库存回滚）

#### POST `/shop/orders/:id/confirm` — 确认收货 🔒（仅SHIPPING状态）

### 商品评价

#### POST `/reviews/products/:productId` — 创建商品评价 🔒（仅已购买用户）

```yaml
Request:
  body:
    rating: number (1-5)
    content?: string
    images?: string[]
```

#### GET `/reviews/products/:productId` — 商品评价列表

#### GET `/reviews/products/:productId/summary` — 评价统计（平均分、总数、分布）

### Banner

#### GET `/banners` — 获取有效 Banner

```yaml
Query: position?: string (如 'shop')
```

#### POST `/banners` — 创建 Banner 🔒 ADMIN

#### PATCH `/banners/:id` — 更新 Banner 🔒 ADMIN

#### DELETE `/banners/:id` — 删除 Banner 🔒 ADMIN

---

## 七、社区模块 `/api/v1/community`

### GET `/community/posts` — 帖子列表

```yaml
Query:
  page?, pageSize?, type?: PostType, keyword?, sortBy?, sortOrder?
Response 200: PaginatedResponse<IPost>
```

### POST `/community/posts` — 发布帖子 🔒

```yaml
Request:
  body:
    type: PostType (required)
    title: string (required, max 200)
    content: string (required, Markdown)
    images?: string[]
    tags?: string[]
Response 201: data: IPost
```

### GET `/community/posts/hot` — 热门话题

```yaml
Response 200: data: { id, title, type, likeCount, commentCount, viewCount }[]
```

### GET `/community/posts/:id` — 帖子详情

### PATCH `/community/posts/:id` — 更新帖子 🔒 (owner)

```yaml
Request:
  body:
    type?: PostType
    title?: string
    content?: string
    images?: string[]
    tags?: string[]
```

### DELETE `/community/posts/:id` — 删除帖子(软删除) 🔒 (owner)

### POST `/community/posts/:id/like` — 点赞 🔒

### GET `/community/posts/:id/checkin` — 挑战打卡状态 🔒

### POST `/community/posts/:id/checkin` — 挑战打卡 🔒

### GET `/community/posts/:id/comments` — 评论列表

### POST `/community/posts/:id/comments` — 发表评论 🔒

### 通知模块 `/api/v1/notifications`

### GET `/notifications` — 用户通知列表 🔒

```yaml
Query:
  page?, pageSize?, isRead?: boolean
Response 200: PaginatedResponse<INotification>
```

### GET `/notifications/unread-count` — 未读通知数 🔒

```yaml
Response 200: data: { count: number }
```

### POST `/notifications/:id/read` — 标记已读 🔒

### POST `/notifications/read-all` — 全部标记已读 🔒

### DELETE `/notifications/:id` — 删除通知 🔒

---

## 八、AI 服务模块 `/api/v1/ai`

### POST `/ai/chat` — AI 智能问答 🔒

```yaml
Request:
  body:
    message: string (required, max 4000)
    sessionId?: string
    context?: string          // 当前学习的课程上下文
Response 200 (SSE stream):
  event: message
  data: { content: string, done: boolean }
Error: data: { error: string, done: true }
```

### POST `/ai/pattern/generate` — AI 纹样生成 🔒

```yaml
Request:
  body:
    prompt: string (required, max 1000)
    style?: 'zhuangjin' | 'yaozu' | 'modern' | 'karst'
    size?: '512x512' | '1024x1024'
Response 200:
  data: { imageUrl: string, prompt: string, style?: string }
```

### POST `/ai/recommend/courses` — 课程推荐 🔒

```yaml
Request:
  body:
    preferences?: string
    limit?: number (1-20, default 5)
Response 200:
  data: { recommendations: string }
```

### POST `/ai/recommend/products` — 商品推荐 🔒

```yaml
Request:
  body:
    preferences?: string
    limit?: number (1-20, default 5)
Response 200:
  data: { recommendations: string }
```

### WebSocket `/ws` — 实时通信

```yaml
Auth: Socket.IO auth token (JWT)
Events:
  Server → Client:
    notification:new — 新通知推送
  Client → Server:
    notification:read — 标记通知已读
Room: user:{userId} (自动加入)
```

---

## 九、文件上传 `/api/v1/upload`

### POST `/upload/image` — 上传图片 🔒

```yaml
Request: multipart/form-data
  file: File (required, max 10MB, jpg/png/webp)
  type: 'avatar' | 'course' | 'artwork' | 'product' | 'post'
Response 201:
  data: { url: string, thumbnailUrl: string }
```

### POST `/upload/video` — 上传视频 🔒 TEACHER

```yaml
Request: multipart/form-data
  file: File (required, max 500MB, mp4/mov)
Response 201:
  data: { url: string, duration: number }
```

---

## 十-b、评价模块 `/api/v1/reviews`

### POST `/reviews/courses/:courseId` — 创建课程评价 🔒

```yaml
Request:
  body:
    rating: number (required, 1-5)
    content?: string
    images?: string[]
Response 201: data: IReview
Errors: 403 未报名 | 409 已评价
```

### GET `/reviews/courses/:courseId` — 获取课程评价列表

```yaml
Query: page?, pageSize?
Response 200: PaginatedResponse<IReview>
```

### GET `/reviews/courses/:courseId/summary` — 获取课程评价统计

```yaml
Response 200:
  data: { average: number, count: number, distribution: Record<1-5, number> }
```

### DELETE `/reviews/:id` — 删除评价 🔒 (owner)

---

## 十、管理后台 `/api/v1/admin` 🔒 ADMIN

### GET `/admin/dashboard` — 数据概览

```yaml
Query:
  period?: 'day' | 'week' | 'month' (default 'day')
Response 200:
  data: {
    userCount, courseCount, orderCount, revenue,
    todayNewUsers, todayOrders, todayRevenue,
    userGrowthChart: [{ date, count }],
    revenueChart: [{ date, amount }],
    topCourses: [{ id, title, enrollCount, coverImage }]
  }
```

### GET `/admin/dashboard/activities` — 近期系统活动

```yaml
Response 200:
  data: Array<{ id, action, entityType, entityId, createdAt, user }>
```

### GET `/admin/users` — 用户管理列表

```yaml
Query:
  page?, pageSize?, keyword?, role?: UserRole, status?: UserStatus
Response 200:
  data: {
    items: Array<{ id, email, nickname, avatar, phone, role, status, createdAt, _count }>,
    pagination
  }
```

### PATCH `/admin/users/:id/role` — 修改用户角色

```yaml
Request:
  body: { role: UserRole }
Response 200: data: User
```

### PATCH `/admin/users/:id/status` — 封禁/解封

```yaml
Request:
  body: { status: UserStatus, reason?: string }
Response 200: data: User
```

### GET `/admin/content/review` — 内容审核队列

```yaml
Query:
  page?, pageSize?, status?: 'REVIEWING' | 'PUBLISHED' | 'REJECTED',
  type?: 'course' | 'artwork' | 'post'
Response 200:
  data: {
    items: Array<{ id, type, title, status, author, createdAt, updatedAt, content?, coverImage? }>,
    pagination
  }
```

### POST `/admin/content/:type/:id/approve` — 审核通过

### POST `/admin/content/:type/:id/reject` — 审核驳回

```yaml
Request:
  body: { reason: string }
```

### POST `/admin/content/batch/approve` — 批量通过

### POST `/admin/content/batch/reject` — 批量驳回

```yaml
Request:
  body: { ids: string[], reason?: string }
```

### CRUD `/admin/banners` — Banner 管理

Banner CRUD 通过 `/api/v1/banners` 端点（已存在），ADMIN 角色守卫。

### CRUD `/admin/ai-configs` — AI 模型配置

```yaml
GET `/ai/configs` — 列表 (ADMIN)
POST `/ai/configs` — 创建 (ADMIN)
PATCH `/ai/configs/:id` — 更新 (ADMIN)
DELETE `/ai/configs/:id` — 删除 (ADMIN)
POST `/ai/configs/:id/test` — 测试连通性 (ADMIN)
```

### GET `/admin/orders` — 订单管理

```yaml
Query:
  page?, pageSize?, status?: OrderStatus, keyword?
Response 200:
  data: {
    items: Array<Order with user, items, payments>,
    pagination
  }
```

### PATCH `/admin/orders/:id/status` — 更新订单状态

```yaml
Request:
  body: { status: string, trackingNo?: string }
```

### GET `/admin/finance/summary` — 财务汇总

```yaml
Response 200:
  data: { totalRevenue, monthlyRevenue, monthGrowth, orderCount, paidOrderCount, averageOrderValue }
```

### GET `/admin/finance/transactions` — 交易流水

```yaml
Query: page?, pageSize?, startDate?, endDate?
```

### GET `/admin/finance/settlements` — 商家结算

### GET `/admin/finance/export` — 导出 CSV

### GET `/admin/audit-logs` — 审计日志

```yaml
Query:
  page?, pageSize?, action?, userId?, startDate?, endDate?
Response 200:
  data: {
    items: Array<{ id, action, entityType, entityId, oldData, newData, ip, userAgent, createdAt, user }>,
    pagination
  }
```

---

## 十一、搜索 `/api/v1/search`

### GET `/search` — 全局搜索

```yaml
Query:
  q: string (required)
  type?: 'course' | 'product' | 'artwork' | 'post' | 'all'
  page?, pageSize?
Response 200:
  data: {
    courses: ICourse[],
    products: IProduct[],
    artworks: IArtwork[],
    posts: IPost[]
  }
```

---

## 十二、错误码表

| HTTP 状态码 | 业务码 | 说明 |
|-------------|--------|------|
| 400 | 40001 | 请求参数验证失败 |
| 400 | 40002 | 库存不足 |
| 401 | 40101 | 未认证 |
| 401 | 40102 | Token 过期 |
| 403 | 40301 | 无权限 |
| 404 | 40401 | 资源不存在 |
| 409 | 40901 | 资源冲突（重复注册等） |
| 429 | 42901 | 请求频率超限 |
| 500 | 50001 | 服务器内部错误 |
| 502 | 50201 | AI 服务调用失败 |
