# 前端统一美化实施记录

日期：2026-05-16

## 目标

基于当前前端真实截图，使用 imagegen 重新生成覆盖核心页面域的统一设计稿，并将设计稿沉淀为可复用的前端视觉系统。实现时遵循 `docs/04_UI_DESIGN_SYSTEM.md`、`docs/07_PAGE_ROUTES.md`、`docs/08_COMPONENT_SPEC.md` 和 `docs/17_PAGE_DESIGN_SPEC.md`。

## 页面覆盖

本轮选择 5 类页面作为统一风格样本：

1. 公开首页：`/`
2. 课程列表：`/courses`
3. 商城列表：`/shop`
4. 社区/画廊内容流：`/community`、`/gallery`
5. 后台/教师数据面板：`/admin/dashboard`、`/teacher/dashboard`

这些页面覆盖 Header、Footer、列表卡片、Hero、内容流、商品/课程卡、数据面板、侧栏与表格等主要前端形态。

## 风格锁定

- 视觉关键词：暖皮革棕、朱红 CTA、暖白纸色、壮锦金、靛蓝信息色、低透明皮革纹理、缝线分隔、现代克制。
- 设计原则：真实业务优先，文化纹样只做低干扰装饰，不使用 Tailwind CSS，不引入霓虹渐变、漂浮光球、无关 stock 图或卡通化插画。
- 组件原则：统一改造共享组件优先，包括 `SiteHeader`、`Footer`、`CourseCard`、`ProductCard`、`ArtworkCard`、`Button`、`Card`、`Input`、`Tag`、后台布局样式。
- 响应式原则：桌面优先保证信息密度，移动端避免横向溢出，按钮与卡片文本不得挤压或重叠。

## 设计稿计划

生成并保存新设计稿到：

- `docs/frontend-beautification/images/01-home-refresh.png`
- `docs/frontend-beautification/images/02-course-shop-refresh.png`
- `docs/frontend-beautification/images/03-community-gallery-refresh.png`
- `docs/frontend-beautification/images/04-admin-teacher-refresh.png`
- `docs/frontend-beautification/images/05-mobile-responsive-refresh.png`

每张设计稿必须基于当前页面截图抽取的信息结构，不新增不相关模块。允许强化视觉层次、纹理、留白、卡片密度、导航质感与图片框架。

移动端设计稿必须覆盖首页首屏、课程筛选列表、商城列表、社区/画廊内容流的折叠方式，作为响应式实现依据。

## 实现边界

优先改造：

- 全局 tokens 与背景肌理：`frontend/src/app/globals.css`
- 公共布局：`frontend/src/components/layout/**`
- 公共 UI：`frontend/src/components/ui/**`
- 核心业务卡片：`frontend/src/components/course/**`、`frontend/src/components/product/**`、`frontend/src/components/artwork/**`
- 页面样式：公开首页、课程、商城、社区、画廊、后台/教师 dashboard

暂不改造：

- 后端业务逻辑、数据库模型、API 合约
- 认证/支付/文件上传等行为逻辑
- 与本次视觉统一无关的深层功能页面

## 验收清单

- 前后端能启动或记录无法启动的明确原因。
- 生成真实页面基线截图与 imagegen 设计稿。
- 新样式统一使用 `--lc-` CSS Variables。
- 无 Tailwind CSS。
- 核心页面桌面与移动端无明显溢出、遮挡、按钮文字挤压。
- 移动端宽度重点验证 390px，并抽查 360px：Header 可折叠，筛选控件可换行或横向滚动，列表卡片单列或双列时文字不挤压，后台页面不出现不可操作的固定侧栏。
- `npm run lint` 与可行的构建/类型检查完成并记录结果。
- 最终实现截图与设计稿进行视觉对比，记录主要一致点与有意偏差。

## 当前验证记录

- 前端开发服务已启动：`http://localhost:3000`
- 后端开发服务已启动：`http://localhost:3001`
- 前端生产构建通过：`npm run build`
- 全量前端 lint 仍有既有后台页面规则报错，主要集中在 `react-hooks/set-state-in-effect`，与本轮视觉样式改造无关
- 已完成桌面与移动截图归档：
  - `docs/frontend-beautification/implementation/home-desktop.png`
  - `docs/frontend-beautification/implementation/home-mobile.png`
  - `docs/frontend-beautification/implementation/courses-desktop.png`
  - `docs/frontend-beautification/implementation/courses-mobile.png`
  - `docs/frontend-beautification/implementation/shop-desktop.png`
  - `docs/frontend-beautification/implementation/shop-mobile.png`
  - `docs/frontend-beautification/implementation/community-desktop.png`
  - `docs/frontend-beautification/implementation/community-mobile.png`
  - `docs/frontend-beautification/implementation/gallery-desktop.png`
  - `docs/frontend-beautification/implementation/gallery-mobile.png`
  - `docs/frontend-beautification/implementation/admin-dashboard-desktop.png`
  - `docs/frontend-beautification/implementation/admin-dashboard-mobile.png`
- 390px 与 360px 响应式检查通过，未发现横向溢出
- 浏览器主流程检查通过：首页 -> 课程中心，页面非空、无框架错误层、控制台无 error/warn
- 已修复首页 `广西非遗专区` 的可读性问题：专区背景恢复为深色专题带，标题和说明在桌面与 390px 移动端均可正常显示，横向卡片不再被挤出视口
- 首页精选区块按响应式控制展示数量：`壮锦皮韵 · 匠心好物` 和 `热门好物` 为桌面 3 / 平板 2 / 手机 1，`传承匠人` 为桌面 4 / 平板 2 / 手机 1；390px 移动端无横向溢出
