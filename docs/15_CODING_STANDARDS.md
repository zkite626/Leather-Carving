# 15 — 编码规范与 Git 规范 | 艺育皮韵

---

## 一、TypeScript 规范

### 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 文件 | kebab-case | `course-card.tsx`, `auth.module.ts` |
| 组件 | PascalCase | `CourseCard`, `SiteHeader` |
| 函数/变量 | camelCase | `getCourseById`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Interface | I 前缀 + PascalCase | `ICourse`, `IUser` |
| Type | PascalCase | `CourseLevel`, `OrderStatus` |
| Enum | PascalCase + UPPER 值 | `enum UserRole { ADMIN, LEARNER }` |
| DTO | PascalCase + Dto 后缀 | `CreateCourseDto` |

### 代码风格

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### ESLint 规则

- 使用 `@typescript-eslint/recommended`
- 禁止 `any`（`@typescript-eslint/no-explicit-any: error`）
- 强制 `async/await` 错误处理
- React: `react-hooks/exhaustive-deps: warn`

---

## 二、Git 规范

### 分支策略

```
main            ← 生产分支（保护分支）
├── develop     ← 开发集成分支
│   ├── feat/course-module     ← 功能分支
│   ├── feat/shop-cart         ← 功能分支
│   ├── fix/auth-token-refresh ← 修复分支
│   └── refactor/api-response  ← 重构分支
├── release/v1.0  ← 发布分支
└── hotfix/xxx    ← 紧急修复
```

### Commit 规范（Conventional Commits）

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建/工具变更 |

示例：
```
feat(course): add chapter sorting with drag and drop
fix(auth): refresh token rotation not invalidating old token
docs(api): update shop API specification for v2
```

### Husky + lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

---

## 三、目录规范

### NestJS 模块结构

```
src/modules/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
├── entities/
│   └── <name>.entity.ts
├── guards/         (可选)
├── interceptors/   (可选)
└── __tests__/
```

### Next.js 组件结构

```
src/components/
├── ui/           # 基础 UI（Button, Card, Input...）
├── layout/       # 布局组件（Header, Sidebar, Footer...）
├── business/     # 业务组件（CourseCard, ProductCard...）
└── forms/        # 表单组件（CourseEditor, AddressForm...）
```

---

## 四、代码审查 Checklist

- [ ] 类型安全：无 `any`，接口定义完整
- [ ] 错误处理：异步操作有 try/catch
- [ ] 安全：无硬编码密钥，用户输入已验证
- [ ] 性能：无 N+1 查询，大列表有分页
- [ ] 测试：新功能有单元测试
- [ ] 文档：公共 API 有 JSDoc 注释
