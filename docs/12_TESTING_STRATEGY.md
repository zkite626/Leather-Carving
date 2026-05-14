# 12 — 测试策略与验收标准 | 艺育皮韵

> 测试金字塔 + 各 Wave 验收 Checklist。

---

## 一、测试金字塔

| 层级 | 工具 | 占比 | 范围 |
|------|------|------|------|
| **单元测试** | Jest | 60% | Service / Utils / 纯函数 |
| **集成测试** | Jest + Supertest | 25% | API 端到端（含数据库） |
| **E2E 测试** | Playwright | 15% | 核心用户流程 |

---

## 二、测试规范

### 后端（NestJS）

```typescript
// 文件命名：*.spec.ts（单元）、*.e2e-spec.ts（集成）
// 位置：每个模块的 __tests__/ 目录下

// 单元测试模板
describe('CourseService', () => {
  let service: CourseService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();
    service = module.get(CourseService);
    prisma = module.get(PrismaService);
  });

  it('should create a course', async () => { /* ... */ });
});

// 集成测试模板
describe('CourseController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    // 使用测试数据库
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('GET /api/v1/courses returns paginated list', () => {
    return request(app.getHttpServer())
      .get('/api/v1/courses')
      .expect(200)
      .expect(res => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
      });
  });
});
```

### 前端（Playwright）

```typescript
// 核心用户流程 E2E
test('学员完整学习流程', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForURL('/');

  await page.goto('/courses');
  await page.click('.course-card:first-child');
  await page.click('button:has-text("报名")');
  await page.waitForURL(/\/learn\//);
  // 验证视频播放器加载...
});
```

---

## 三、各 Wave 验收 Checklist

### Wave 1 验收

- [ ] cd frontend && npm run dev 成功启动前后端
- [ ] 数据库迁移脚本可执行
- [ ] 注册→登录→获取用户信息流程正常
- [ ] JWT 过期后自动刷新
- [ ] 受保护路由未登录跳转登录页
- [ ] RBAC 角色守卫生效
- [ ] 设计系统 CSS Variables 生效
- [ ] 暗色模式切换正常
- [ ] 响应式布局适配三端

### Wave 2 验收

- [ ] 课程 CRUD 接口全部通过
- [ ] 视频上传 + 转码成功
- [ ] 课程列表筛选/搜索正常
- [ ] 报名→学习→进度记录完整
- [ ] 课程详情 SSR 正确渲染
- [ ] Meilisearch 搜索索引同步

### Wave 3 验收

- [ ] 作品发布+多图上传正常
- [ ] 作品画廊瀑布流展示正常
- [ ] 3D 模型加载与交互正常
- [ ] 纹样素材库展示与下载正常
- [ ] 点赞/收藏功能正常

### Wave 4 验收

- [ ] 商品 CRUD + 多图正常
- [ ] 分类树管理正常
- [ ] 购物车增删改正常
- [ ] 下单→支付→发货→确认收货流程完整
- [ ] 库存扣减正确
- [ ] 商品评价正常
- [ ] 广西特色商品标识展示

### Wave 5 验收

- [ ] AI 智能问答流式响应正常
- [ ] AI 纹样生成功能正常
- [ ] 社区发帖/评论/点赞正常
- [ ] AI 模型后台配置切换正常
- [ ] 课程/商品推荐正常
- [ ] 通知系统正常

### Wave 6 验收

- [ ] 管理仪表盘数据正确
- [ ] 用户管理（封禁/角色变更）正常
- [ ] 内容审核流程正常
- [ ] 财务数据正确
- [ ] Banner 管理正常
- [ ] 审计日志记录正确

### Wave 7 验收

- [ ] Lighthouse 性能评分 ≥ 80
- [ ] 核心 E2E 测试全部通过
- [ ] Docker Compose 一键部署成功
- [ ] 无 P0/P1 级 Bug
- [ ] 文档完善

---

## 四、测试数据

- 使用 Prisma Seed 脚本初始化测试数据
- 包含：10 个测试用户（各角色）、20 门课程、50 件商品、100 篇帖子
- CI 环境使用独立测试数据库
