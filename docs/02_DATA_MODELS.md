# 02 — 数据模型 | 艺育皮韵

> Prisma Schema 定义 + TypeScript 共享类型。规范即代码——所有业务实体的唯一真相源。

---

## 一、Prisma Schema

### 1.1 用户与认证

```prisma
// ========== 用户 ==========
model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  phone         String?   @unique
  passwordHash  String    @map("password_hash")
  nickname      String
  avatar        String?
  bio           String?
  role          UserRole  @default(LEARNER)
  status        UserStatus @default(ACTIVE)
  emailVerified Boolean   @default(false) @map("email_verified")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  // 关联
  courses       Course[]        @relation("TeacherCourses")
  enrollments   Enrollment[]
  artworks      Artwork[]
  orders        Order[]
  cartItems     CartItem[]
  posts         Post[]
  comments      Comment[]
  favorites     Favorite[]
  reviews       Review[]
  notifications Notification[]
  teacherProfile TeacherProfile?

  @@map("users")
}

enum UserRole {
  LEARNER       // 学员
  TEACHER       // 教师/传承人
  MERCHANT      // 商家
  ADMIN         // 管理员
  SUPER_ADMIN   // 超级管理员
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

model TeacherProfile {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @unique @map("user_id") @db.Uuid
  title          String?                       // 头衔：非遗传承人/高级工艺师
  specialties    String[]                      // 擅长技法
  experience     Int?                          // 从艺年限
  certifications Json?    @db.JsonB            // 资质证书
  introduction   String?  @db.Text             // 详细介绍
  isVerified     Boolean  @default(false) @map("is_verified")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@map("teacher_profiles")
}
```

### 1.2 课程系统

```prisma
model Course {
  id           String       @id @default(uuid()) @db.Uuid
  teacherId    String       @map("teacher_id") @db.Uuid
  title        String
  slug         String       @unique
  subtitle     String?
  description  String?      @db.Text
  coverImage   String?      @map("cover_image")
  level        CourseLevel  @default(BEGINNER)
  category     String?                        // 课程分类
  tags         String[]
  price        Decimal      @default(0) @db.Decimal(10, 2)
  originalPrice Decimal?    @map("original_price") @db.Decimal(10, 2)
  isFree       Boolean      @default(false) @map("is_free")
  status       CourseStatus @default(DRAFT)
  totalDuration Int         @default(0) @map("total_duration") // 总时长(秒)
  totalLessons  Int         @default(0) @map("total_lessons")
  enrollCount   Int         @default(0) @map("enroll_count")
  rating        Decimal     @default(0) @db.Decimal(3, 2)
  metadata      Json?       @db.JsonB         // 扩展元数据
  publishedAt   DateTime?   @map("published_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")
  deletedAt     DateTime?   @map("deleted_at")

  teacher      User         @relation("TeacherCourses", fields: [teacherId], references: [id])
  chapters     Chapter[]
  enrollments  Enrollment[]
  reviews      Review[]

  @@index([teacherId])
  @@index([status, level])
  @@index([slug])
  @@map("courses")
}

enum CourseLevel {
  BEGINNER     // 入门
  INTERMEDIATE // 进阶
  ADVANCED     // 精通
  MASTER       // 大师
}

enum CourseStatus {
  DRAFT
  REVIEWING
  PUBLISHED
  ARCHIVED
}

model Chapter {
  id        String   @id @default(uuid()) @db.Uuid
  courseId   String   @map("course_id") @db.Uuid
  title     String
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons Lesson[]

  @@index([courseId])
  @@map("chapters")
}

model Lesson {
  id           String     @id @default(uuid()) @db.Uuid
  chapterId    String     @map("chapter_id") @db.Uuid
  title        String
  type         LessonType @default(VIDEO)
  content      String?    @db.Text            // 图文内容(Markdown)
  videoUrl     String?    @map("video_url")
  duration     Int        @default(0)         // 时长(秒)
  isFreePreview Boolean   @default(false) @map("is_free_preview")
  sortOrder    Int        @default(0) @map("sort_order")
  attachments  Json?      @db.JsonB           // 附件列表
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  chapter    Chapter          @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  progresses LessonProgress[]

  @@index([chapterId])
  @@map("lessons")
}

enum LessonType {
  VIDEO
  ARTICLE
  QUIZ
  PRACTICE   // 实操任务
}

model Enrollment {
  id          String           @id @default(uuid()) @db.Uuid
  userId      String           @map("user_id") @db.Uuid
  courseId     String           @map("course_id") @db.Uuid
  status      EnrollmentStatus @default(ACTIVE)
  progress    Decimal          @default(0) @db.Decimal(5, 2) // 百分比
  enrolledAt  DateTime         @default(now()) @map("enrolled_at")
  completedAt DateTime?        @map("completed_at")
  expiredAt   DateTime?        @map("expired_at")

  user     User             @relation(fields: [userId], references: [id])
  course   Course           @relation(fields: [courseId], references: [id])
  lessons  LessonProgress[]

  @@unique([userId, courseId])
  @@map("enrollments")
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}

model LessonProgress {
  id           String   @id @default(uuid()) @db.Uuid
  enrollmentId String   @map("enrollment_id") @db.Uuid
  lessonId     String   @map("lesson_id") @db.Uuid
  isCompleted  Boolean  @default(false) @map("is_completed")
  watchedDuration Int   @default(0) @map("watched_duration") // 已观看(秒)
  lastPosition Int      @default(0) @map("last_position")    // 上次播放位置
  completedAt  DateTime? @map("completed_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson     Lesson     @relation(fields: [lessonId], references: [id])

  @@unique([enrollmentId, lessonId])
  @@map("lesson_progresses")
}
```

### 1.3 作品系统

```prisma
model Artwork {
  id          String        @id @default(uuid()) @db.Uuid
  userId      String        @map("user_id") @db.Uuid
  title       String
  description String?       @db.Text
  coverImage  String        @map("cover_image")
  category    String?
  tags        String[]
  techniques  String[]                          // 使用技法
  materials   String[]                          // 使用材料
  status      ArtworkStatus @default(DRAFT)
  viewCount   Int           @default(0) @map("view_count")
  likeCount   Int           @default(0) @map("like_count")
  is3D        Boolean       @default(false) @map("is_3d")
  modelUrl    String?       @map("model_url")   // 3D 模型文件
  story       String?       @db.Text            // 创作故事
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  deletedAt   DateTime?     @map("deleted_at")

  user     User           @relation(fields: [userId], references: [id])
  images   ArtworkImage[]
  comments Comment[]

  @@index([userId])
  @@index([status])
  @@map("artworks")
}

enum ArtworkStatus {
  DRAFT
  REVIEWING
  PUBLISHED
  REJECTED
}

model ArtworkImage {
  id        String   @id @default(uuid()) @db.Uuid
  artworkId String   @map("artwork_id") @db.Uuid
  url       String
  caption   String?
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  artwork Artwork @relation(fields: [artworkId], references: [id], onDelete: Cascade)

  @@index([artworkId])
  @@map("artwork_images")
}
```

### 1.4 商城系统

```prisma
model ProductCategory {
  id        String   @id @default(uuid()) @db.Uuid
  parentId  String?  @map("parent_id") @db.Uuid
  name      String
  slug      String   @unique
  icon      String?
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  parent   ProductCategory?  @relation("CategoryTree", fields: [parentId], references: [id])
  children ProductCategory[] @relation("CategoryTree")
  products Product[]

  @@map("product_categories")
}

model Product {
  id            String        @id @default(uuid()) @db.Uuid
  merchantId    String        @map("merchant_id") @db.Uuid
  categoryId    String?       @map("category_id") @db.Uuid
  name          String
  slug          String        @unique
  description   String?       @db.Text
  coverImage    String        @map("cover_image")
  price         Decimal       @db.Decimal(10, 2)
  originalPrice Decimal?      @map("original_price") @db.Decimal(10, 2)
  stock         Int           @default(0)
  stockAlert    Int           @default(10) @map("stock_alert") // 库存预警阈值
  sales         Int           @default(0)
  rating        Decimal       @default(0) @db.Decimal(3, 2)
  status        ProductStatus @default(DRAFT)
  isGuangxi     Boolean       @default(false) @map("is_guangxi") // 广西特色标识
  attributes    Json?         @db.JsonB    // 商品属性（规格/材质/尺寸等）
  tags          String[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  deletedAt     DateTime?     @map("deleted_at")

  category   ProductCategory? @relation(fields: [categoryId], references: [id])
  images     ProductImage[]
  orderItems OrderItem[]
  cartItems  CartItem[]
  reviews    Review[]

  @@index([merchantId])
  @@index([categoryId])
  @@index([status])
  @@map("products")
}

enum ProductStatus {
  DRAFT
  ON_SALE
  OFF_SALE
  SOLD_OUT
}

model ProductImage {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @map("product_id") @db.Uuid
  url       String
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_images")
}

model CartItem {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  productId String   @map("product_id") @db.Uuid
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
  @@map("cart_items")
}

model Order {
  id            String      @id @default(uuid()) @db.Uuid
  orderNo       String      @unique @map("order_no")
  userId        String      @map("user_id") @db.Uuid
  totalAmount   Decimal     @db.Decimal(10, 2) @map("total_amount")
  payAmount     Decimal     @db.Decimal(10, 2) @map("pay_amount")
  status        OrderStatus @default(PENDING)
  address       Json        @db.JsonB          // 收货地址快照
  remark        String?
  paidAt        DateTime?   @map("paid_at")
  shippedAt     DateTime?   @map("shipped_at")
  completedAt   DateTime?   @map("completed_at")
  cancelledAt   DateTime?   @map("cancelled_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  user     User        @relation(fields: [userId], references: [id])
  items    OrderItem[]
  payments Payment[]

  @@index([userId])
  @@index([status])
  @@index([orderNo])
  @@map("orders")
}

enum OrderStatus {
  PENDING       // 待支付
  PAID          // 已支付
  SHIPPING      // 已发货
  COMPLETED     // 已完成
  CANCELLED     // 已取消
  REFUNDING     // 退款中
  REFUNDED      // 已退款
}

model OrderItem {
  id          String  @id @default(uuid()) @db.Uuid
  orderId     String  @map("order_id") @db.Uuid
  productId   String  @map("product_id") @db.Uuid
  productName String  @map("product_name")       // 快照
  productImage String @map("product_image")      // 快照
  price       Decimal @db.Decimal(10, 2)         // 下单时价格
  quantity    Int

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Payment {
  id            String        @id @default(uuid()) @db.Uuid
  orderId       String        @map("order_id") @db.Uuid
  transactionNo String?       @map("transaction_no")
  method        PaymentMethod
  amount        Decimal       @db.Decimal(10, 2)
  status        PaymentStatus @default(PENDING)
  paidAt        DateTime?     @map("paid_at")
  rawData       Json?         @db.JsonB @map("raw_data") // 支付回调原始数据
  createdAt     DateTime      @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id])

  @@map("payments")
}

enum PaymentMethod {
  WECHAT
  ALIPAY
  MOCK      // 开发环境模拟支付
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

### 1.5 社区系统

```prisma
model Post {
  id        String     @id @default(uuid()) @db.Uuid
  userId    String     @map("user_id") @db.Uuid
  type      PostType   @default(DISCUSSION)
  title     String
  content   String     @db.Text
  images    String[]
  tags      String[]
  viewCount Int        @default(0) @map("view_count")
  likeCount Int        @default(0) @map("like_count")
  commentCount Int     @default(0) @map("comment_count")
  isPinned  Boolean    @default(false) @map("is_pinned")
  status    PostStatus @default(PUBLISHED)
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  deletedAt DateTime?  @map("deleted_at")

  user     User      @relation(fields: [userId], references: [id])
  comments Comment[]

  @@index([userId])
  @@index([type, status])
  @@map("posts")
}

enum PostType {
  DISCUSSION   // 讨论
  SHOWCASE     // 作品展示
  QUESTION     // 提问
  TUTORIAL     // 教程分享
  CHALLENGE    // 挑战打卡
}

enum PostStatus {
  PUBLISHED
  HIDDEN
  DELETED
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  postId    String?  @map("post_id") @db.Uuid
  artworkId String?  @map("artwork_id") @db.Uuid
  parentId  String?  @map("parent_id") @db.Uuid
  content   String   @db.Text
  likeCount Int      @default(0) @map("like_count")
  createdAt DateTime @default(now()) @map("created_at")
  deletedAt DateTime? @map("deleted_at")

  user    User      @relation(fields: [userId], references: [id])
  post    Post?     @relation(fields: [postId], references: [id])
  artwork Artwork?  @relation(fields: [artworkId], references: [id])
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([artworkId])
  @@map("comments")
}

model Review {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  courseId   String?  @map("course_id") @db.Uuid
  productId String?  @map("product_id") @db.Uuid
  rating    Int                                    // 1-5
  content   String?  @db.Text
  images    String[]
  createdAt DateTime @default(now()) @map("created_at")

  user    User     @relation(fields: [userId], references: [id])
  course  Course?  @relation(fields: [courseId], references: [id])
  product Product? @relation(fields: [productId], references: [id])

  @@map("reviews")
}

model Favorite {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  entityType String   @map("entity_type")  // course / product / artwork
  entityId   String   @map("entity_id") @db.Uuid
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, entityType, entityId])
  @@map("favorites")
}

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  type      String                                // order / course / system / community
  title     String
  content   String
  isRead    Boolean  @default(false) @map("is_read")
  link      String?                               // 跳转链接
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@map("notifications")
}
```

### 1.6 系统配置

```prisma
model AiModelConfig {
  id           String   @id @default(uuid()) @db.Uuid
  capability   String                  // chat / vision / image_gen
  providerType String   @map("provider_type")  // openai_compat / other
  displayName  String   @map("display_name")
  baseUrl      String   @map("base_url")
  apiKey       String   @map("api_key")        // 加密存储
  modelName    String   @map("model_name")
  isActive     Boolean  @default(false) @map("is_active")
  extraParams  Json?    @db.JsonB @map("extra_params")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("ai_model_configs")
}

model Banner {
  id        String   @id @default(uuid()) @db.Uuid
  title     String
  image     String
  link      String?
  position  String   @default("home")  // home / course / shop
  sortOrder Int      @default(0) @map("sort_order")
  isActive  Boolean  @default(true) @map("is_active")
  startAt   DateTime? @map("start_at")
  endAt     DateTime? @map("end_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("banners")
}

model PatternAsset {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  category    String                    // 壮锦 / 瑶族 / 喀斯特 / 现代
  imageUrl    String   @map("image_url")
  thumbnailUrl String? @map("thumbnail_url")
  description String?
  origin      String?                   // 来源/出处
  tags        String[]
  downloadCount Int    @default(0) @map("download_count")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("pattern_assets")
}

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  action     String                     // CREATE / UPDATE / DELETE
  entityType String   @map("entity_type")
  entityId   String   @map("entity_id")
  oldData    Json?    @db.JsonB @map("old_data")
  newData    Json?    @db.JsonB @map("new_data")
  ip         String?
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

## 二、TypeScript 共享类型（shared/types）

```typescript
// ===== 用户 =====
export interface IUser {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
}

export type UserRole = 'LEARNER' | 'TEACHER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

// ===== 课程 =====
export interface ICourse {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  level: CourseLevel;
  price: number;
  isFree: boolean;
  status: CourseStatus;
  teacher: Pick<IUser, 'id' | 'nickname' | 'avatar'>;
  totalDuration: number;
  totalLessons: number;
  enrollCount: number;
  rating: number;
  tags: string[];
}

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
export type CourseStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'ARCHIVED';

// ===== 商品 =====
export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sales: number;
  rating: number;
  isGuangxi: boolean;
  category?: IProductCategory;
  images: IProductImage[];
  tags: string[];
}

export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: IProductCategory[];
}

// ===== 订单 =====
export interface IOrder {
  id: string;
  orderNo: string;
  totalAmount: number;
  payAmount: number;
  status: OrderStatus;
  items: IOrderItem[];
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';

// ===== 社区 =====
export interface IPost {
  id: string;
  type: PostType;
  title: string;
  content: string;
  images: string[];
  author: Pick<IUser, 'id' | 'nickname' | 'avatar'>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export type PostType = 'DISCUSSION' | 'SHOWCASE' | 'QUESTION' | 'TUTORIAL' | 'CHALLENGE';

// ===== API 通用 =====
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```
