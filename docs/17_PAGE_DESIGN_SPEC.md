# 17 — 页面设计规范与设计图索引 | 艺育皮韵

> 本文档记录本轮页面视觉设计结果。设计图统一存放于 `docs/page-designs/images/`，详细页面映射与美术资源生成规范见 `docs/page-designs/README.md`。

---

## 一、设计结论

艺育皮韵采用统一的“皮革质感 x 壮锦纹样 x 匠人暖光”页面母版。公开页、学员工作台、商城、社区 AI、教师后台虽然信息结构不同，但必须共享同一套品牌色、导航、卡片、按钮、表单、侧栏、纹理和图像风格。

本轮已生成 5 张页面设计板：

| 设计板 | 文件 |
|--------|------|
| 公开页面 | `docs/page-designs/images/01-public-pages.png` |
| 认证与学员工作台 | `docs/page-designs/images/02-learner-auth-dashboard.png` |
| 商城与订单 | `docs/page-designs/images/03-shop-order-pages.png` |
| 社区与 AI | `docs/page-designs/images/04-community-ai-pages.png` |
| 教师后台 | `docs/page-designs/images/05-teacher-pages.png` |

---

## 二、统一页面原则

1. 所有页面必须遵循 `docs/04_UI_DESIGN_SYSTEM.md` 中的 CSS Variables。
2. 同一页面域内的 Header、Sidebar、Card、Button、Input、Tag、Badge 必须复用组件，不做局部特殊样式。
3. 皮雕元素以真实图片、低透明皮革纹理、缝线分隔、壮锦边框、印章徽章呈现。
4. 禁止使用 Tailwind CSS、随机占位图、无关 stock 图、霓虹渐变、漂浮光球、卡通插画。
5. 页面应服务真实业务流程，后台和工作台页面优先信息密度与操作效率。

---

## 三、设计板使用方式

前端实现时按以下顺序使用文档：

1. 读取 `docs/07_PAGE_ROUTES.md` 确认路由和权限。
2. 读取 `docs/page-designs/README.md` 找到路由对应设计图。
3. 读取 `docs/08_COMPONENT_SPEC.md` 确认组件接口。
4. 读取 `docs/04_UI_DESIGN_SYSTEM.md` 使用设计 token 编写样式。
5. 如缺课程封面、作品图、商品图、头像、纹样或纹理，按 `docs/page-designs/README.md` 的 image_gen 模板生成项目素材；若 image_gen 不可用，按 `docs/18_ART_ASSET_BACKLOG.md` 占位并登记缺口。

---

## 四、后续补图规则

当前图片素材已覆盖主要页面域。若实现阶段需要更细页面状态，例如管理后台独立审核详情、移动端断点、空状态、错误状态、深色模式，应继续使用 image_gen 生成同风格设计图或素材，并保存到：

```text
docs/page-designs/images/
```

命名规则：

```text
NN-domain-state.png
```

例如：

```text
06-admin-pages.png
07-mobile-breakpoints.png
08-empty-error-states.png
```

生成提示词必须包含统一风格锁定词：暖皮革棕、朱红 CTA、暖白纸色、壮锦金、低透明皮革纹理、缝线分隔、现代克制、非遗皮雕教育平台。
