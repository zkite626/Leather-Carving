# Wave 4 开发提示词 — 商城系统

> 将本文档完整复制到 AI 编码助手的上下文中使用。

---

```markdown
# 项目：艺育皮韵 — 非遗皮雕数字教育平台
# 技术栈：Next.js 15 + NestJS 11 + PostgreSQL + Prisma + Redis + MinIO
# 架构：前后端分离（frontend/ + backend/ 独立部署）
# 当前阶段：Wave 4 — 商城系统
# 前置完成：Wave 1-3

## 你的角色
你是全栈工程师，本 Wave 实现完整电商闭环。

## 必读规范
- docs/02_DATA_MODELS.md — Product/Cart/Order/Payment 模型
- docs/03_API_SPECIFICATION.md — 商城模块 API
- docs/08_COMPONENT_SPEC.md — ProductCard, CartDrawer
- docs/17_PAGE_DESIGN_SPEC.md — 页面设计规范与统一母版
- docs/page-designs/README.md — 页面设计图索引与美术资源规范
- docs/18_ART_ASSET_BACKLOG.md — image_gen 不可用时的占位与资源缺口策略

## Wave 4 完整任务

### 一、后端
1. ProductCategory Module: 分类树 CRUD（支持嵌套，parentId 自引用），排序管理
2. Product Module:
   - 商品 CRUD + 多图上传（最多 10 张）+ 属性管理(JSONB: 规格/材质/尺寸等)
   - 列表查询：分类筛选/价格区间/关键词/广西特色(isGuangxi)/排序(最新/最热/价格升降)
   - 库存管理 + 库存预警（低于阈值通知管理员）
   - 商品状态：草稿/上架/下架/售罄
3. Cart Module: 购物车 CRUD（数据库持久化），加购时校验库存，最大 50 件
4. Order Module:
   - 创建订单：库存校验 + 乐观锁扣减（version 字段），数据库事务保证一致性
   - 订单号生成：LC + 日期 + 随机数（如 LC20260501XXXX）
   - 订单状态流转：PENDING → PAID → SHIPPING → COMPLETED / CANCELLED
   - 取消订单（库存回滚，事务处理）
   - 确认收货
   - 订单状态变更通知（BullMQ → 邮件 + WebSocket 推送）
5. Payment Module: Mock 支付实现（开发环境直接标记为已支付）
6. Review Module: 商品评价 CRUD（仅已购买用户可评价）+ 评分统计
7. Address Module: 收货地址 CRUD（省市区三级数据），每用户最多 10 个地址
8. 商品搜索索引同步 Meilisearch

### 二、前端
1. /shop — 商城首页
   - 顶部 Banner 轮播（从后台配置读取）
   - 分类导航横栏（图标 + 名称，横向滚动）
   - 广西特色专区（isGuangxi 筛选，金色边框 + "广西非遗" 徽章）
   - 商品网格列表 + 左侧筛选侧栏（分类树/价格/评分）
2. /shop/[slug] — 商品详情
   - 多图轮播（大图 + 缩略图导航）
   - 价格展示（原价划线 + 现价高亮），广西非遗金色徽章
   - 规格/属性展示
   - 数量选择 + 加入购物车 + 立即购买
   - 商品详情（富文本/图文混排）
   - 评价区（评分统计柱状图 + 评价列表 + 分页）
3. /cart — 购物车页面
   - 商品列表（图片+名称+单价+数量调整+小计+删除）
   - 全选/取消全选 + 批量删除
   - 底部固定栏：已选件数 + 总价 + 去结算按钮
4. /checkout — 结算页
   - 收货地址管理（选择/新增/编辑，省市区三级联动）
   - 订单商品确认列表
   - 配送方式（默认快递）
   - 支付方式选择
   - 提交订单按钮
5. /my-orders — 我的订单
   - Tab 切换：全部/待付款/待发货/待收货/已完成
   - 订单卡片：商品缩略图+名称+状态+金额+操作按钮(去支付/确认收货/评价)
6. /my-orders/[id] — 订单详情（状态时间线 + 商品列表 + 物流信息）
7. 购物车 Zustand Store + API 双写（未登录用 localStorage，登录后同步到服务端）

### 三、页面设计与美术资源
1. 商城首页、商品详情、分类浏览、购物车、结算、订单列表和订单详情统一参考 `docs/page-designs/images/03-shop-order-pages.png`。
2. 商品卡、订单卡、结算摘要、规格选择、支付方式必须保持同一套暖皮革视觉和电商信息层级。
3. 缺商品图、商城 Banner、商家头像、评价图片时，优先使用 image_gen 按 `docs/page-designs/README.md` 生成。
4. 若 image_gen 无法使用，按 `docs/18_ART_ASSET_BACKLOG.md` 使用占位图并登记缺口，继续完成购物车、下单、支付和订单状态流转。

### 四、技术要点
- 下单使用数据库事务（Prisma $transaction）保证库存扣减和订单创建的原子性
- 库存扣减使用乐观锁（WHERE version = currentVersion，UPDATE version = version + 1）
- 购物车使用 Zustand Store（useCartStore）+ localStorage 持久化 + 登录后 API 同步
- 订单号生成：`LC${yyyyMMdd}${randomDigits(4)}` 确保唯一性
- 广西特色商品卡片增加金色渐变边框 + 角标"广西非遗"徽章
- 省市区三级联动数据使用静态 JSON（中国行政区划数据包）

## 💡 AI 提效建议
- **鼓励使用相关技能**：在开发过程中，强烈建议你（AI 助手）主动调用内置工具（如搜索、读写文件、执行终端命令等）来查阅规范文档、分析项目代码、运行验证脚本，以提升开发效率并确保代码的准确性和合理性。不要仅仅被动依赖用户的复制粘贴。

## ⚠️ 文档同步要求
完成开发任务后，必须检查并更新以下文档：
- 新增/修改 API → 更新 docs/03_API_SPECIFICATION.md
- 新增/修改数据模型 → 更新 docs/02_DATA_MODELS.md
- 新增/修改组件 → 更新 docs/08_COMPONENT_SPEC.md
- 完成 Wave → 在 docs/16_WAVE_ROADMAP.md 中勾选验收标准
```
