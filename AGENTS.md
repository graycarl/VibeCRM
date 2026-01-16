# VibeCRM 项目技术架构与决策总结

## 一、项目概述

VibeCRM 是一个**元数据驱动的应用开发平台 (Metadata Driven App Platform)**，类似于 Salesforce 的低代码开发能力。核心理念是通过配置元数据（对象、字段、页面布局等）来快速构建业务应用，系统在运行时根据元数据动态生成 UI 界面和数据库结构。

---

## 二、核心技术栈

| 层级 | 技术 | 版本要求 |
|------|------|----------|
| **后端** | Python + FastAPI + SQLAlchemy (Sync) | Python 3.11+ |
| **前端** | React + TypeScript + Material UI | React 18.2+, TS 5.0+ |
| **数据库** | SQLite | 本地文件数据库 |
| **包管理** | `uv` (Python), `npm` (Node) | - |
| **测试** | `pytest` (后端), `vitest` (前端) | - |
| **构建工具** | Makefile | GNU Make 3.81+ |

---

## 三、核心架构决策

### 1. 数据存储策略：Table-Per-Object（独立表存储）

- 每个 `Object` 在数据库中对应一张**独立的物理表** (`data_{api_name}`)
- 优点：兼顾灵活性与性能，便于扩展
- 元数据变更（如添加字段）会**同步执行 DDL**，确保元数据与物理存储即时一致

### 2. 双模界面架构

- **Runtime App**：面向最终用户的运行时应用，根据元数据动态渲染列表、表单和详情页
- **Admin Console**：面向管理员的管理控制台，用于创建和维护元数据
- 两者界面风格统一但功能区分清晰

### 3. 元数据核心概念

- **Object (MetaObject)**：业务实体的元数据定义，包含 Label、API Name 等
- **Field (MetaField)**：对象属性的元数据定义，支持多种数据类型
- **PageLayout**：定义对象详情页和编辑页的字段分组、顺序
- **ListView**：定义对象列表页显示的列和筛选条件
- **MetaRole**：角色定义，用于 RBAC 权限控制

### 4. 支持的字段类型

| 类型 | 说明 | 存储映射 |
|------|------|----------|
| `Text` | 单行文本 | TEXT |
| `TextArea` | 多行文本 | TEXT |
| `Number` | 数字 | REAL |
| `Boolean` | 布尔值 | INTEGER |
| `Date` | 日期 | TEXT |
| `Datetime` | 日期时间 | TEXT (UTC ISO8601) |
| `Picklist` | 单选列表 | TEXT (存储 name) |
| `Lookup` | 查找关系 (1:N) | TEXT (存储目标 ID) |

---

## 四、关键实现模式

### 1. 后端架构模式

```
backend/
├── app/
│   ├── api/endpoints/      # API 路由 (meta.py, data.py)
│   ├── core/               # 配置、安全
│   ├── db/                 # 数据库连接、初始化、种子数据
│   ├── models/             # SQLAlchemy 模型 (元数据表)
│   ├── services/           # 业务逻辑
│   │   ├── schema_service.py  # 动态 DDL 操作
│   │   ├── data_service.py    # 业务数据 CRUD
│   │   └── meta_service.py    # 元数据 CRUD
│   └── schemas/            # Pydantic Schemas
```

**关键服务职责**:
- **SchemaService**: 负责动态建表、加列等 DDL 操作
- **DataService**: 负责业务数据的 CRUD，包含分页、校验逻辑
- **MetaService**: 负责元数据的 CRUD

### 2. 前端架构模式

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # 通用组件 (反馈、错误处理)
│   │   ├── data/           # 数据组件 (DynamicDataGrid)
│   │   └── dynamic/        # 动态渲染组件 (DynamicForm)
│   ├── layouts/            # 布局组件 (MainLayout)
│   ├── pages/
│   │   ├── admin/          # 管理控制台页面
│   │   └── runtime/        # 运行时应用页面
│   ├── services/           # API 客户端 (metaApi, dataApi)
│   ├── types/              # TypeScript 类型定义
│   └── theme/              # MUI 主题配置
```

**关键组件**:
- **DynamicForm**: 根据元数据动态渲染表单，支持所有字段类型
- **DynamicDataGrid**: 封装 MUI X DataGrid，支持动态列、分页
- **MainLayout**: 应用外壳，包含导航侧边栏

### 3. API 设计规范

- 采用 RESTful API (JSON)
- 分页参数通过 URL Query Parameters 传递 (`?skip=0&limit=50`)
- 分页响应格式：`{ items: [], total: number }`
- 使用 Pydantic Schema 定义请求/响应模型

---

## 五、重要技术决策记录

### 1. Datetime 字段处理

- 数据库存储：UTC 格式 (ISO8601 字符串)
- 前端显示：自动转换为用户本地时区
- **系统时间戳**：所有对象默认包含 `created_at` 和 `updated_at` 字段，由后端自动维护，前端只读

### 2. Picklist 字段处理

- 存储结构：`MetaField.options` 为 JSON 数组 `[{"name": "...", "label": "..."}]`
- 显示逻辑：存储 `name`，显示 `label`

### 3. 分页策略

- 默认每页 50 条，支持 10/25/50 选项
- 默认按 `created_at` 降序排列

---

## 六、编码规范与陷阱

### 1. Python 后端

- 使用 `uv run` 运行 Python 程序或脚本

### 2. React 前端

- **Hook 陷阱**：避免在组件 Props 解构时使用对象字面量作为默认值（如 `props = {}`），这会导致 `useEffect` 无限循环。应在组件外部定义常量作为默认值
- 测试运行时需要添加 `--run` 参数
- 单元/组件测试遵循"就近原则"（.test.tsx 放在源码目录下）
- 集成/E2E 测试放在 `frontend/tests/` 目录

### 3. Material UI 使用规范

- 优先使用 MUI 组件而非原生 HTML
- 使用 System Props 或 Styled API 定制样式，避免内联 CSS

### 4. 文档查询

- 查阅第三方类库文档时，使用 context7 相关工具
