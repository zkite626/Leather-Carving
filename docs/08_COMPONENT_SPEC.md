# 08 — 组件规格定义 | 艺育皮韵

> 每个核心 React 组件的 Props、状态、交互行为定义。SDD 核心——先定义组件接口再编码。

---

## 一、基础 UI 组件

### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'accent' | 'ghost' | 'text' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
// Hover: translateY(-1px) + 阴影增强
// Active: scale(0.98)
// Loading: 显示 Spinner, 禁用点击
```

### Card

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;       // hover 抬升效果
  leatherTexture?: boolean;  // 皮革纹理叠加
  onClick?: () => void;
  children: ReactNode;
}
```

### Input / Textarea

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;       // 前缀图标
  suffix?: ReactNode;       // 后缀图标
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}
```

### Modal

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  closeOnOverlay?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}
// 动画：fade + scale(0.95→1)
// 背景：backdrop-filter blur
```

### Toast / Notification

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;         // ms, 默认 3000
  position?: 'top-right' | 'top-center' | 'bottom-right';
}
```

### Avatar / Badge / Tag / Skeleton / Pagination — 标准规范略

---

## 二、布局组件

### SiteHeader

```typescript
interface SiteHeaderProps {
  transparent?: boolean;     // 首页顶部透明
}
// 包含：Logo + 主导航 + 搜索 + 通知 + 用户菜单
// 滚动时背景变为半透明毛玻璃
// 移动端：汉堡菜单
```

### SiteSidebar

```typescript
interface SiteSidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
}
interface SidebarItem {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: string | number;
  children?: SidebarItem[];
}
```

### PageHero

```typescript
interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundPattern?: 'zhuangjin' | 'leather' | 'gradient';
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
}
// 壮锦纹样装饰边框 + 渐变背景
```

---

## 三、业务组件

### CourseCard

```typescript
interface CourseCardProps {
  course: ICourse;
  layout?: 'vertical' | 'horizontal';
  showTeacher?: boolean;
  showProgress?: boolean;    // 已报名时显示进度条
  progress?: number;
}
// 垂直：封面图(16:9) → 标题 → 教师 → 价格/级别
// 水平：左图 + 右信息
// Hover：封面放大 1.05 + 阴影增强
```

### ProductCard

```typescript
interface ProductCardProps {
  product: IProduct;
  showGuangxiBadge?: boolean;  // 广西特色徽章
  onAddToCart?: () => void;
}
// 封面图 → 名称 → 价格(原价划线) → 评分 + 销量
// 广西特色商品显示金色"广西非遗"徽章
```

### ArtworkCard

```typescript
interface ArtworkCardProps {
  artwork: IArtwork;
  layout?: 'masonry' | 'grid';
}
// 瀑布流布局，图片自适应高度
// Hover 显示标题、作者、点赞数
```

### VideoPlayer

```typescript
interface VideoPlayerProps {
  src: string;
  poster?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  initialPosition?: number;   // 续播位置
  playbackRates?: number[];
}
```

### LearningPanel

```typescript
interface LearningPanelProps {
  course: ICourseDetail;
  currentLesson: ILesson;
  enrollment: IEnrollment;
  onLessonChange: (lessonId: string) => void;
}
// 左侧：视频播放器 + 课时内容
// 右侧：章节大纲 + 进度指示 + AI 助手入口
```

### CartDrawer

```typescript
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: ICartItem[];
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}
// 右侧抽屉滑出
// 底部固定：总价 + 结算按钮
```

### AIChatWidget

```typescript
interface AIChatWidgetProps {
  sessionId?: string;
  context?: string;           // 当前页面上下文
  position?: 'inline' | 'floating';
  placeholder?: string;
}
// floating: 右下角悬浮气泡
// inline: 嵌入页面
// 支持 SSE 流式打字效果
```

### PatternGallery

```typescript
interface PatternGalleryProps {
  patterns: IPatternAsset[];
  onSelect?: (pattern: IPatternAsset) => void;
  filterable?: boolean;
  categories?: string[];
}
// 网格展示纹样素材
// 点击预览大图 + 下载
```

### HeritageMap

```typescript
interface HeritageMapProps {
  locations: IHeritageLocation[];
  onLocationClick?: (location: IHeritageLocation) => void;
}
// 广西地图 + 标记非遗体验基地
// 点击查看详情、导航
```

---

## 四、表单组件

### CourseEditor

```typescript
interface CourseEditorProps {
  initialData?: ICourse;
  onSubmit: (data: CreateCourseDto) => Promise<void>;
  mode: 'create' | 'edit';
}
// 多步表单：基本信息 → 章节课时 → 定价 → 发布
// 富文本编辑器（课程描述）
// 拖拽排序章节和课时
```

### ProductEditor

```typescript
interface ProductEditorProps {
  initialData?: IProduct;
  categories: IProductCategory[];
  onSubmit: (data: CreateProductDto) => Promise<void>;
  onAIGenerate?: (name: string) => Promise<string>; // AI 生成描述
}
// 多图上传 + 拖拽排序
// AI 一键生成商品描述按钮
```

### AddressForm

```typescript
interface AddressFormProps {
  initialData?: IAddress;
  onSubmit: (address: IAddress) => void;
}
// 省市区三级联动
```

---

## Wave 3 — 创作与展示组件

### ArtworkCard

```typescript
interface ArtworkCardProps {
  artwork: IArtwork;
}
// 瀑布流卡片：图片 + hover 浮层（标题、作者头像+昵称、❤️ 点赞数）
// CSS columns masonry 布局，图片自适应高度
// Link 到 /gallery/[id]
```

### ImageLightbox

```typescript
// 内置于 /gallery/[id] 页面
// 全屏灯箱：左右切换、键盘导航（←→）、ESC 关闭、缩放、图片计数器
// CSS transform + 手势事件
```

### ModelViewer (3D)

```typescript
interface ModelViewerProps {
  modelUrl: string;        // glTF/GLB URL
  autoRotate?: boolean;
}
// @react-three/fiber + @react-three/drei
// OrbitControls（旋转/缩放/平移）
// Environment 光照 + ContactShadows
// useGLTF 加载模型
```

### CommentSection

```typescript
interface CommentSectionProps {
  entityType: 'artwork' | 'post';
  entityId: string;
}
// 嵌套评论，最多 3 层深度
// 回复按钮 → parentId 传参
// 删除自己的评论
// 用户头像 + 昵称 + 时间
```

### FavoriteButton

```typescript
interface FavoriteButtonProps {
  entityType: string;
  entityId: string;
  initialCount?: number;
}
// ❤️ 点赞按钮，带动画反馈（scale pop）
// 幂等切换：已收藏则取消
// 实时更新计数
```

### PatternGallery

```typescript
interface PatternGalleryProps {
  compact?: boolean;
}
// 分类 Tab：全部 / 壮锦 / 瑶族 / 喀斯特 / 现代
// 网格展示缩略图 + hover overlay
// 点击打开预览大图 Modal
// 一键下载 + 下载计数
```
