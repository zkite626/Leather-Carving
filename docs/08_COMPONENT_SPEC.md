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

---

## Wave 4 — 商城系统组件

### ProductCard

```typescript
interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}
// 商品卡片：封面(1:1) → 名称(2行截断) → 价格(原价划线+现价高亮) → 评分+销量
// 广西特色：金色渐变边框 + "广西非遗"金色角标
// 售罄状态：居中半透明遮罩
// 加入购物车按钮：hover 变色
// Link 到 /shop/[slug]
// 实现：frontend/src/components/product/product-card/
```

### CartStore (Zustand)

```typescript
// 购物车状态管理：localStorage 持久化 + 服务端同步
// Actions: addItem, removeItem, updateQuantity, toggleSelect, selectAll, deselectAll, removeSelected, clearCart, syncFromServer
// Computed: getSelectedCount, getSelectedTotal, getTotalCount, getSelectedItems
// 实现：frontend/src/stores/cart-store.ts
```

### /shop — 商城首页

```typescript
// Banner 轮播（自动切换 5s，圆点导航）
// 分类导航横栏（横向滚动，图标+名称）
// 广西特色专区（金色背景色调，ProductCard 网格）
// 热销好物 + 新品上架推荐区
// 全部商品列表（左侧分类筛选侧栏 + 价格区间 + 关键词搜索 + 排序按钮 + 分页）
// 实现：frontend/src/app/shop/page.tsx
```

### /shop/[slug] — 商品详情页

```typescript
// 面包屑导航
// 左侧：多图轮播（大图 + 缩略图导航）
// 右侧：商品名称、广西非遗徽章、价格展示、评分+销量、属性/规格展示、数量选择器、加入购物车+立即购买按钮
// Tab 切换：商品详情(富文本) + 商品评价(评分统计柱状图 + 评价列表 + 分页)
// 实现：frontend/src/app/shop/[slug]/page.tsx
```

### /cart — 购物车页面

```typescript
// 全选/取消全选 + 批量删除
// 商品列表：复选框 + 缩略图 + 名称 + 单价 + 数量调整 + 小计 + 删除
// 底部固定栏：已选件数 + 总价 + 去结算按钮
// 空购物车状态：购物袋图标 + "购物车还是空的" + 去逛逛链接
// 登录后自动同步服务端购物车
// 实现：frontend/src/app/cart/page.tsx
```

### /checkout — 结算页

```typescript
// 步骤指示器（3步：确认订单/支付/完成）
// 收货地址管理（选择/新增，设为默认）
// 订单商品确认列表
// 订单摘要：商品数量 + 金额 + 运费(免运费) + 合计 + 备注
// 提交订单 → 创建订单 API → 清除已选购物车 → 跳转我的订单
// 实现：frontend/src/app/checkout/page.tsx
```

### /my-orders — 我的订单

```typescript
// Tab 切换：全部/待付款/待发货/待收货/已完成（含计数徽章）
// 订单卡片：订单号+日期+状态标签+商品列表+总金额+操作按钮
// 操作按钮：去支付/取消订单(PENDING)、确认收货(SHIPPING)、评价/再次购买(COMPLETED)
// 分页 + 空状态
// 实现：frontend/src/app/my-orders/page.tsx
```
