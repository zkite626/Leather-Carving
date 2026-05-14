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
  page?, pageSize?, category?, tags?, keyword?, sortBy?
Response 200: PaginatedResponse<IArtwork>
```

### GET `/artworks/:id` — 作品详情

### POST `/artworks` — 发布作品 🔒

```yaml
Request: multipart/form-data
  title: string (required)
  description?: string
  category?: string
  techniques?: string[]
  materials?: string[]
  images: File[] (required, max 9)
  story?: string
Response 201: data: IArtwork
```

### POST `/artworks/:id/like` — 点赞 🔒

### DELETE `/artworks/:id/like` — 取消点赞 🔒

---

## 六、商城模块 `/api/v1/shop`

### GET `/shop/products` — 商品列表

```yaml
Query:
  page?, pageSize?, categoryId?, isGuangxi?, minPrice?, maxPrice?,
  keyword?, sortBy?: 'price' | 'sales' | 'rating' | 'createdAt'
Response 200: PaginatedResponse<IProduct>
```

### GET `/shop/products/:slug` — 商品详情

### GET `/shop/categories` — 分类树

```yaml
Response 200:
  data: IProductCategory[] (嵌套树形)
```

### POST `/shop/cart` — 添加到购物车 🔒

```yaml
Request:
  body:
    productId: string (required)
    quantity: number (required, min 1)
Response 201: data: CartItem
```

### GET `/shop/cart` — 获取购物车 🔒

### PATCH `/shop/cart/:id` — 更新购物车数量 🔒

### DELETE `/shop/cart/:id` — 删除购物车项 🔒

### POST `/shop/orders` — 创建订单 🔒

```yaml
Request:
  body:
    items: Array<{ productId, quantity }>
    address: { name, phone, province, city, district, detail, zipCode }
    remark?: string
Response 201:
  data: IOrder & { paymentUrl?: string }
Errors: 400 库存不足 | 400 商品下架
```

### GET `/shop/orders` — 我的订单列表 🔒

### GET `/shop/orders/:id` — 订单详情 🔒

### POST `/shop/orders/:id/pay` — 支付订单 🔒

### POST `/shop/orders/:id/cancel` — 取消订单 🔒

### POST `/shop/orders/:id/confirm` — 确认收货 🔒

### POST `/shop/products/:id/reviews` — 商品评价 🔒

---

## 七、社区模块 `/api/v1/community`

### GET `/community/posts` — 帖子列表

```yaml
Query:
  page?, pageSize?, type?: PostType, keyword?, sortBy?
Response 200: PaginatedResponse<IPost>
```

### POST `/community/posts` — 发布帖子 🔒

### GET `/community/posts/:id` — 帖子详情

### POST `/community/posts/:id/like` — 点赞 🔒

### GET `/community/posts/:id/comments` — 评论列表

### POST `/community/posts/:id/comments` — 发表评论 🔒

---

## 八、AI 服务模块 `/api/v1/ai`

### POST `/ai/chat` — AI 智能问答 🔒

```yaml
Request:
  body:
    message: string (required)
    sessionId?: string
    context?: string          // 当前学习的课程上下文
Response 200 (SSE stream):
  event: message
  data: { content: string, done: boolean }
```

### POST `/ai/pattern/generate` — AI 纹样生成 🔒

```yaml
Request:
  body:
    prompt: string (required)
    style?: 'zhuangjin' | 'yaozu' | 'modern' | 'karst'
    size?: '512x512' | '1024x1024'
Response 200:
  data: { imageUrl: string, prompt: string }
```

### POST `/ai/recommend/courses` — 课程推荐 🔒

### POST `/ai/recommend/products` — 商品推荐 🔒

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
Response 200:
  data: {
    userCount, courseCount, orderCount, revenue,
    todayNewUsers, todayOrders, todayRevenue,
    userGrowthChart, revenueChart, topCourses, topProducts
  }
```

### GET `/admin/users` — 用户管理列表

### PATCH `/admin/users/:id/role` — 修改用户角色

### PATCH `/admin/users/:id/status` — 封禁/解封

### GET `/admin/content/review` — 内容审核队列

### POST `/admin/content/:id/approve` — 审核通过

### POST `/admin/content/:id/reject` — 审核驳回

### CRUD `/admin/banners` — Banner 管理

### CRUD `/admin/categories` — 分类管理

### CRUD `/admin/ai-configs` — AI 模型配置

### GET `/admin/orders` — 订单管理

### GET `/admin/finance/summary` — 财务汇总

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
