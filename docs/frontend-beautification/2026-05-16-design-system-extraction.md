# 前端美化设计系统提取

日期：2026-05-16

## 参考文件

### 基线截图

- `docs/frontend-beautification/baseline/home-desktop.png`
- `docs/frontend-beautification/baseline/courses-desktop.png`
- `docs/frontend-beautification/baseline/shop-desktop.png`
- `docs/frontend-beautification/baseline/community-desktop.png`
- `docs/frontend-beautification/baseline/gallery-desktop.png`
- `docs/frontend-beautification/baseline/home-mobile.png`
- `docs/frontend-beautification/baseline/courses-mobile.png`

### 新设计稿

- `docs/frontend-beautification/images/01-home-refresh.png`
- `docs/frontend-beautification/images/02-course-shop-refresh.png`
- `docs/frontend-beautification/images/03-community-gallery-refresh.png`
- `docs/frontend-beautification/images/04-admin-teacher-refresh.png`
- `docs/frontend-beautification/images/05-mobile-responsive-refresh.png`

## 提取结论

### 全局画布

- 背景从单纯暖白升级为纸感画布：浅暖底色、低透明皮革颗粒、非常淡的斜纹或壮锦线条。
- 深色区域只用于首页首屏、商品专题带、CTA 和后台侧栏，不能让全站变成重色主题。
- 页面分区使用“纸面内容带 + 缝线分隔 + 少量深皮革带”形成节奏。

### 导航

- 桌面 Header 更薄、更精致，保持 64px 附近高度。
- 首页首屏附近 Header 可使用深色半透明毛玻璃，其余页面使用暖纸色毛玻璃。
- 移动端 Header 固定为 logo + 搜索图标 + 菜单图标，不塞入完整搜索框。
- 移动端菜单使用下拉抽屉，导航项至少 44px 高。

### Hero

- 首页 Hero 必须图片主导，左侧放标题与短说明，右侧/背景保留皮雕工具与皮革作品。
- 列表页 Hero 不做大营销首屏，使用紧凑纸面纹样带，标题、说明和轻装饰即可。
- 移动端 Hero 高度控制在首屏 40% 左右，保证下方入口卡片可见。

### 卡片

- 卡片统一使用 12px-16px 圆角，边框比阴影更重要。
- 商品/课程卡统一为稳定图片比例 + 信息区 + 元信息行。
- 课程列表移动端使用横向卡片，商品列表移动端可双列卡片。
- 空状态要保留，但不能撑出大片死白，应使用轻纹理面板、明确 CTA 或推荐入口。

### 控件

- 筛选控件统一为 segmented/chips，激活态用皮革棕底或白底金棕文字。
- 搜索与价格输入使用 40px-44px 高度，移动端允许横向滚动 chips 或收进筛选行。
- CTA 使用朱红或皮革棕，普通次级按钮使用描边。

### 后台

- 后台是操作界面，不采用营销式大 Hero。
- 侧栏使用深皮革色，当前项用朱红/金色强调。
- 卡片保持紧凑，图表颜色使用主棕、靛蓝、草绿和金色。
- 移动端后台隐藏固定侧栏，使用顶部按钮打开抽屉。

## 实现优先级

1. 全局 tokens、纸感/皮革纹理、通用响应式安全线。
2. Header/Footer/Button/Card/Input/Tag 等共享样式。
3. 首页：首页 Hero、数据条、核心入口、产品/教师/CTA。
4. 课程/商城列表：Hero、筛选栏、卡片网格、空状态。
5. 社区/画廊：Hero、内容卡、feed/masonry。
6. Admin/Teacher dashboard：侧栏、顶栏、统计卡、图表卡、移动端抽屉。

## 移动端验收点

- 390px 和 360px 下没有横向滚动。
- Header 不遮挡内容，菜单可打开并关闭。
- 首页首屏图片、标题、统计、入口卡片均可读。
- 课程筛选栏不挤压，卡片内容不截断价格/评分。
- 商城双列卡片图片比例一致，价格行不重叠。
- 社区/画廊卡片单列或双列清晰，操作图标不挤在一起。
- 后台页面主内容可读，侧栏不会固定覆盖主内容。

## 实现对比结论

- 保留设计稿的主方向：暖皮革棕、朱红行动色、暖纸底、低透明纹理、缝线/边框分隔。
- 首页实现与 `01-home-refresh.png` 一致保留图片主导首屏、数据带、四入口、商品带、匠人区和 CTA 区；因真实数据结构限制，商品与匠人卡片数量以接口返回为准。
- 课程与商城实现沿用 `02-course-shop-refresh.png` 的紧凑列表页结构：纹理页头、筛选面板、稳定图片比例、价格/评分元信息。
- 社区与画廊实现沿用 `03-community-gallery-refresh.png` 的内容流样式；当前数据库为空时显示空状态，不注入假数据。
- 后台与教师 dashboard 沿用 `04-admin-teacher-refresh.png` 的深皮革侧栏、暖纸面板、紧凑数据卡，不使用营销式 Hero。
- 移动端实现参考 `05-mobile-responsive-refresh.png`：Header 折叠为 logo、搜索、注册、菜单；列表页面使用单列或双列稳定卡片；后台页面主内容单列呈现。
