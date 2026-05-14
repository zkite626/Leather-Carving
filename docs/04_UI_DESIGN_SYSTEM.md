# 04 — UI/UX 设计系统 | 艺育皮韵

> Design Tokens + CSS Variables + 组件视觉规范。设计灵感来源：皮革质感 × 壮锦纹样 × 匠人暖光。

---

## 一、设计哲学

- **匠心暖光**：温暖的皮革色调 + 手工质感 + 匠人工坊的光影氛围
- **文化融合**：广西民族纹样作为装饰元素，贯穿整个视觉体系
- **现代克制**：以现代极简为骨架，文化元素点缀为辅，不过度装饰

---

## 二、色彩体系（CSS Variables）

```css
:root {
  /* ===== 主色系 — 皮革暖色 ===== */
  --lc-primary: #B5651D;           /* 皮革棕 — 主色 */
  --lc-primary-light: #D4944A;     /* 浅棕 */
  --lc-primary-dark: #8B4513;      /* 深棕 */
  --lc-primary-50: #FFF8F0;        /* 极浅暖白 */
  --lc-primary-100: #FDECD2;
  --lc-primary-200: #F9D4A0;
  --lc-primary-900: #3D1C00;

  /* ===== 强调色 ===== */
  --lc-accent: #C84B31;            /* 朱红 — CTA 按钮/高亮 */
  --lc-accent-light: #E06B52;
  --lc-accent-dark: #A33A22;

  /* ===== 辅助色 ===== */
  --lc-indigo: #2B4C7E;            /* 靛蓝 — 信息/链接 */
  --lc-gold: #D4A853;              /* 壮锦金 — 装饰/徽章 */
  --lc-sage: #7BA05B;              /* 草绿 — 成功 */
  --lc-coral: #E8836B;             /* 珊瑚 — 警告 */

  /* ===== 中性色 ===== */
  --lc-bg: #FFFCF8;               /* 页面背景 — 暖白 */
  --lc-bg-secondary: #F5EDE3;     /* 卡片背景 — 暖灰 */
  --lc-bg-tertiary: #EDE3D5;      /* 深层背景 */
  --lc-text: #2D1B0E;             /* 主文字 — 深棕 */
  --lc-text-secondary: #6B5B4F;   /* 次要文字 */
  --lc-text-muted: #9B8E82;       /* 辅助文字 */
  --lc-border: #E0D5C8;           /* 边框 */
  --lc-divider: #EDE3D5;          /* 分隔线 */

  /* ===== 语义色 ===== */
  --lc-success: #7BA05B;
  --lc-warning: #E8A634;
  --lc-error: #D94F4F;
  --lc-info: #5B9BD5;

  /* ===== 阴影 ===== */
  --lc-shadow-sm: 0 1px 3px rgba(45, 27, 14, 0.06);
  --lc-shadow-md: 0 4px 12px rgba(45, 27, 14, 0.08);
  --lc-shadow-lg: 0 8px 30px rgba(45, 27, 14, 0.12);
  --lc-shadow-xl: 0 16px 48px rgba(45, 27, 14, 0.16);

  /* ===== 排版 ===== */
  --lc-font-sans: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
  --lc-font-serif: 'Noto Serif SC', 'Source Han Serif SC', serif;
  --lc-font-display: 'Outfit', 'Inter', sans-serif;
  --lc-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --lc-text-xs: 0.75rem;      /* 12px */
  --lc-text-sm: 0.875rem;     /* 14px */
  --lc-text-base: 1rem;       /* 16px */
  --lc-text-lg: 1.125rem;     /* 18px */
  --lc-text-xl: 1.25rem;      /* 20px */
  --lc-text-2xl: 1.5rem;      /* 24px */
  --lc-text-3xl: 1.875rem;    /* 30px */
  --lc-text-4xl: 2.25rem;     /* 36px */
  --lc-text-5xl: 3rem;        /* 48px */

  /* ===== 间距 ===== */
  --lc-space-1: 0.25rem;   /* 4px */
  --lc-space-2: 0.5rem;    /* 8px */
  --lc-space-3: 0.75rem;   /* 12px */
  --lc-space-4: 1rem;      /* 16px */
  --lc-space-5: 1.25rem;   /* 20px */
  --lc-space-6: 1.5rem;    /* 24px */
  --lc-space-8: 2rem;      /* 32px */
  --lc-space-10: 2.5rem;   /* 40px */
  --lc-space-12: 3rem;     /* 48px */
  --lc-space-16: 4rem;     /* 64px */
  --lc-space-20: 5rem;     /* 80px */

  /* ===== 圆角 ===== */
  --lc-radius-sm: 6px;
  --lc-radius-md: 10px;
  --lc-radius-lg: 16px;
  --lc-radius-xl: 24px;
  --lc-radius-full: 9999px;

  /* ===== 动画 ===== */
  --lc-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --lc-duration-fast: 150ms;
  --lc-duration-normal: 250ms;
  --lc-duration-slow: 400ms;

  /* ===== 层级 ===== */
  --lc-z-dropdown: 100;
  --lc-z-sticky: 200;
  --lc-z-modal-backdrop: 300;
  --lc-z-modal: 400;
  --lc-z-toast: 500;
}

/* ===== 暗色模式 ===== */
[data-theme="dark"] {
  --lc-bg: #1A1410;
  --lc-bg-secondary: #252018;
  --lc-bg-tertiary: #302920;
  --lc-text: #F5EDE3;
  --lc-text-secondary: #B8A89A;
  --lc-text-muted: #7A6E62;
  --lc-border: #3D3428;
  --lc-divider: #302920;
  --lc-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --lc-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

---

## 三、响应式断点

| 断点 | 宽度 | 目标设备 |
|------|------|----------|
| `xs` | < 480px | 小屏手机 |
| `sm` | ≥ 480px | 大屏手机 |
| `md` | ≥ 768px | 平板 |
| `lg` | ≥ 1024px | 小屏桌面 |
| `xl` | ≥ 1280px | 桌面 |
| `2xl` | ≥ 1536px | 大屏桌面 |

```css
/* 布局容器 */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--lc-space-4);
}
@media (min-width: 768px) { .container { padding: 0 var(--lc-space-8); } }
```

---

## 四、组件规范概览

### 4.1 按钮

| 变体 | 背景 | 用途 |
|------|------|------|
| Primary | `--lc-primary` | 主操作 |
| Accent | `--lc-accent` | 购买/报名等 CTA |
| Ghost | 透明 + 边框 | 次要操作 |
| Text | 仅文字 | 内联操作 |
| Danger | `--lc-error` | 删除/危险操作 |

尺寸：`sm`(32px)、`md`(40px)、`lg`(48px)

### 4.2 卡片

- 背景：`--lc-bg-secondary`
- 圆角：`--lc-radius-lg`
- 阴影：`--lc-shadow-md`
- Hover 效果：`translateY(-2px)` + 阴影增强
- 可选皮革纹理背景叠加（`opacity: 0.03`）

### 4.3 输入框

- 高度：44px（md）
- 边框：`1px solid var(--lc-border)`
- 焦点态：`border-color: var(--lc-primary)` + `box-shadow: 0 0 0 3px rgba(181,101,29,0.1)`
- 错误态：`border-color: var(--lc-error)`

### 4.4 导航栏

- 高度：64px
- 背景：`rgba(255,252,248,0.85)` + `backdrop-filter: blur(12px)`
- 暗色模式：`rgba(26,20,16,0.85)`

---

## 五、动画规范

```css
/* 进入动画 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 皮雕纹样旋转装饰 */
@keyframes patternSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 骨架屏 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 使用原则 */
/* - 页面进入：fadeInUp, duration-normal */
/* - 交互反馈：duration-fast */
/* - 大区域转场：duration-slow */
/* - 减少动画偏好：prefers-reduced-motion 时禁用非必要动画 */
```

---

## 六、图标体系

| 库 | 用途 |
|----|------|
| Lucide React | 通用图标 |
| 自定义 SVG | 皮雕工具图标（刻刀、印花模具、皮料等） |

---

## 七、特色装饰元素

| 元素 | 用途 | 实现 |
|------|------|------|
| 壮锦纹样边框 | 页面 Hero、卡片装饰 | SVG 重复背景 |
| 皮革纹理叠加 | 卡片/区块背景 | 半透明 PNG 纹理 |
| 针线缝合效果 | 分隔线装饰 | CSS border-image |
| 印章/徽章 | 认证标识 | SVG 组件 |

---

## 八、页面设计母版

页面设计图统一存放在 `docs/page-designs/images/`，设计说明与页面映射见 `docs/page-designs/README.md` 和 `docs/17_PAGE_DESIGN_SPEC.md`。

实现页面时必须保持以下一致性：

- 公开页、学员工作台、商城、社区 AI、教师/管理后台共用同一套色彩、字体、圆角、阴影、卡片和按钮样式。
- Header、Sidebar、PageHero、CourseCard、ArtworkCard、ProductCard、AIChatWidget 等组件应作为共享组件实现，不为单页复制样式。
- 皮革纹理、壮锦纹样、缝线、印章徽章只作为低干扰装饰，主要内容仍以信息可读性为先。
- 如缺少课程封面、作品图、商品图、头像、纹样、皮革纹理等美术资源，应按 `docs/page-designs/README.md` 中的 image_gen 模板生成，并保存为项目内静态资源。
