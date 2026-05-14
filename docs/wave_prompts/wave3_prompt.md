# Wave 3 开发提示词 — 创作与展示

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis + MinIO
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 3 — 创作与展示
# 前置完成：Wave 1（架构+认证） + Wave 2（教学系统）

## 你的角色
你是全栈工程师，本 Wave 聚焦作品管理、画廊展示、3D 模型查看和纹样素材库。

## 必读规范
- docs/02_DATA_MODELS.md — Artwork/ArtworkImage/PatternAsset 模型
- docs/03_API_SPECIFICATION.md — 作品模块 API
- docs/08_COMPONENT_SPEC.md — ArtworkCard, PatternGallery, HeritageMap
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 3 完整任务

### 一、后端
1. Artwork Module: 作品 CRUD + 多图上传（最多 9 张）+ 审核状态(pending/approved/rejected)
2. ArtworkImage: 图片排序管理，支持设为封面
3. 点赞/收藏: 通用 Favorite 机制（entityType + entityId 区分课程/作品/帖子），幂等操作
4. Comment Module: 评论 CRUD（支持嵌套回复，限制 3 层深度），评论审核
5. PatternAsset: 纹样素材管理 CRUD（管理员上传管理），分类：壮锦/瑶族/喀斯特/现代
6. 作品搜索索引同步至 Meilisearch（标题、描述、技法、材料标签）

### 二、前端
1. /gallery — 作品画廊
   - CSS Grid 瀑布流布局（columns: 4/3/2/1 响应式），图片自适应高度
   - 无限滚动（Intersection Observer API）
   - 筛选栏：分类/技法/关键词搜索
   - ArtworkCard: 图片 + hover 浮层（标题、作者头像+昵称、❤️ 点赞数）
2. /gallery/[id] — 作品详情
   - 图片灯箱（左右切换/键盘导航/缩放/手势滑动）
   - 3D 模型查看器（@react-three/fiber + @react-three/drei，支持 glTF/GLB）
   - 创作故事（Markdown 渲染）、使用技法标签、材料标签
   - 评论区（嵌套回复，最多 3 层）
   - 点赞❤️/收藏⭐按钮（带动画反馈）
   - 相关作品推荐（同技法/同作者）
3. /create/artwork — 发布作品
   - 多图上传：拖拽 + 点击上传 + 排序 + 预览 + 设封面 + 删除
   - 技法多选标签（镂刻/印花/染色/烙烫/浮雕等）
   - 材料多选标签（牛皮/羊皮/马皮等）
   - 创作故事编辑（Markdown 或简易富文本）
   - 可选：上传 3D 模型文件（.glb/.gltf）
4. /my-artworks — 我的作品管理（状态：草稿/待审核/已通过/已驳回）
5. 纹样素材库组件（可嵌入多个页面）
   - 分类 Tab：壮锦 / 瑶族 / 喀斯特 / 现代融合
   - 网格展示缩略图 + 点击预览大图 + 一键下载
6. /heritage-map — 非遗地图（可选，使用 Leaflet + 高德瓦片）
   - 广西地图 + 标记非遗体验基地
   - 点击标记查看详情卡片

### 三、页面设计与美术资源
1. 作品画廊、作品详情、非遗地图参考 `docs/page-designs/images/01-public-pages.png`。
2. 发布作品和我的作品参考 `docs/page-designs/images/02-learner-auth-dashboard.png`。
3. 纹样素材库可参考 `docs/page-designs/images/04-community-ai-pages.png` 中的纹样资源面板。
4. 作品图、纹样图、皮革纹理、3D 预览封面必须保持同一套非遗皮雕视觉语言。
5. 若缺作品图、纹样图、皮革纹理或 3D 预览图，优先使用 image_gen 按 `docs/page-designs/README.md` 生成。
6. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 使用占位图并登记缺口，继续完成作品上传、画廊、评论和 3D 交互。

### 四、技术要点
- 瀑布流使用 CSS `columns` 或 CSS Grid + JS 动态计算行高
- 3D 模型使用 @react-three/fiber + @react-three/drei（OrbitControls, Environment, useGLTF）
- 灯箱使用自定义 Modal + CSS transform + 手势事件
- 无限滚动使用 Intersection Observer API + SWR 分页
- 图片上传预览使用 URL.createObjectURL，上传后替换为服务端 URL
- 评论嵌套限制 3 层深度（parentId 引用）

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档：
- 新增/修改 API → 更新 docs/03_API_SPECIFICATION.md
- 新增/修改数据模型 → 更新 docs/02_DATA_MODELS.md
- 新增/修改组件 → 更新 docs/08_COMPONENT_SPEC.md
- 完成 Wave → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
