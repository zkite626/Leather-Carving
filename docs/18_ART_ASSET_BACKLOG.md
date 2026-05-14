# 18 — 美术资源缺口与占位策略 | 艺育皮韵

> 当 image_gen 不可用、生成失败、网络受限或暂时无法确认版权时，开发不得被素材卡住。先使用项目内占位资源继续实现页面结构与交互，同时在本文档记录缺口，后续统一补齐。

---

## 一、处理原则

1. 不使用随机外链图片、无关 stock 图或风格不一致素材。
2. 可以先使用项目内占位图、CSS 纹理块、渐变底色、图标化空状态继续开发。
3. 占位资源必须保持最终尺寸比例，避免后续替换时引起布局跳动。
4. 每个占位资源必须有明确 `alt` 文本和语义文件名。
5. 缺口必须登记到本文档，写明用途、目标风格、建议尺寸和替换路径。
6. image_gen 恢复后，按 `docs/page-designs/README.md` 中的统一提示词模板生成并替换。

---

## 二、推荐占位目录

```text
frontend/public/images/placeholders/
  hero-workshop-placeholder.png
  course-cover-placeholder.png
  artwork-placeholder.png
  product-placeholder.png
  avatar-placeholder.png
  pattern-placeholder.png
  texture-placeholder.png
  vector/                         # 可编辑 SVG 源稿
```

如果前端项目尚未创建，可先在实现对应 Wave 时创建这些文件。占位图可以用简单 SVG/PNG 或 CSS 背景生成，但必须使用艺育皮韵的色板：暖白、皮革棕、朱红、壮锦金、深棕文字。

---

## 三、缺口登记表

| 状态 | 资源 | 使用页面/组件 | 目标风格 | 建议尺寸 | 临时占位路径 | 最终替换路径 |
|------|------|---------------|----------|----------|--------------|--------------|
| 占位已补，最终待确认 | 首页工坊 Hero | `/`, `/login`, `/register` | 暖光工坊、皮雕花纹、刻刀和皮料 | `1920x1080` | `frontend/public/images/placeholders/hero-workshop-placeholder.png` | `frontend/public/images/generated/hero-workshop.png` |
| 占位已补，最终待确认 | 课程封面组 | `CourseCard`, `/courses/[slug]`, 学习页 | 皮雕步骤、工具、牡丹/壮锦纹样 | `1200x675` | `frontend/public/images/placeholders/course-cover-placeholder.png` | `frontend/public/images/generated/courses/*.png` |
| 占位已补，最终待确认 | 作品图组 | `ArtworkCard`, `/gallery`, `/gallery/[id]` | 真实皮雕成品，多比例，高清细节 | 长边 `1600px` | `frontend/public/images/placeholders/artwork-placeholder.png` | `frontend/public/images/generated/artworks/*.png` |
| 占位已补，最终待确认 | 商品图组 | `ProductCard`, 商品详情、订单快照 | 皮雕钱包、包具、杯垫、工具包 | `1200x1200` / `1200x900` | `frontend/public/images/placeholders/product-placeholder.png` | `frontend/public/images/generated/products/*.png` |
| 占位已补，最终待确认 | 用户头像组 | 教师、学员、商家、评论 | 中国手工艺人/学习者，真实头像风格 | `512x512` | `frontend/public/images/placeholders/avatar-placeholder.png` | `frontend/public/images/generated/avatars/*.png` |
| 占位已补，最终待确认 | 纹样素材组 | 纹样库、AI 纹样生成、装饰图案 | 原创壮锦/瑶族/喀斯特转译纹样 | `1024x1024` | `frontend/public/images/placeholders/pattern-placeholder.png` | `frontend/public/images/generated/patterns/*.png` |
| 占位已补，最终待确认 | 皮革无缝纹理 | 卡片纹理、区块背景 | 低对比皮革纹理，可低透明叠加 | `1024x1024` | `frontend/public/images/placeholders/texture-placeholder.png` | `frontend/public/images/generated/textures/leather-grain.png` |
| 占位已补，最终待确认 | 默认 OG 分享图 | 全站 metadata / 社交分享 | 皮革暖色品牌图，适合分享卡片裁切 | `1200x630` | `frontend/public/images/og-default.png` | `frontend/public/images/generated/og-default.png` |

---

## 四、占位实现要求

- 图片容器必须定义稳定 `aspect-ratio`，例如课程封面 `16 / 9`、商品图 `1 / 1`。
- 占位图应有低透明皮革纹理、细线边框和居中图标，不显示“图片加载失败”等技术文案。
- 列表卡片、详情页媒体区和上传预览区都必须在无真实图片时保持完整布局。
- 替换真实素材时不得修改组件结构，只替换资源 URL 和 mock 数据。
- 占位 PNG 为前端运行资源；`frontend/public/images/placeholders/vector/` 中的 SVG 仅作为可编辑源稿保存。

---

## 五、补图提示词入口

补图时直接使用 `docs/page-designs/README.md` 的 `image_gen 统一提示词模板`。若生成的是页面设计图，保存到：

```text
docs/page-designs/images/
```

若生成的是前端运行素材，保存到：

```text
frontend/public/images/generated/
```
