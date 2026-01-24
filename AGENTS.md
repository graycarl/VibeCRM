# VibeCRM Instructions for AI Agents

VibeCRM 是一个**元数据驱动的应用开发平台 (Metadata Driven App Platform)**，类似于 Salesforce 的低代码开发能力。核心理念是通过配置元数据（对象、字段、页面布局等）来快速构建业务应用，系统在运行时根据元数据动态生成 UI 界面和数据库结构。

## 需求分析

当需求方案通过用户确认后，在 dev-logs 目录下创建对应的需求目录（如 req-002-some-feature-name），将方案写入目录下的 plan.md 文件；


## 核心技术栈

| 层级 | 技术 | 版本要求 |
|------|------|----------|
| **后端** | Python + FastAPI + SQLAlchemy (Sync) | Python 3.11+ |
| **前端** | React + TypeScript + Material UI | React 18.2+, TS 5.0+ |
| **数据库** | SQLite | 本地文件数据库 |
| **包管理** | `uv` (Python), `npm` (Node) | - |
| **测试** | `pytest` (后端), `vitest` (前端) | - |

## 术语定义

- **对象（Object / MetaObject）**：业务实体的元数据定义，包含标签、API 名称等信息。
- **字段（Field / MetaField）**：对象属性的元数据定义，支持多种数据类型。
- **控制台（Admin Console）**：面向管理员的管理界面，用于创建和维护元数据。
- **运行时应用（Runtime App）**：面向最终用户的应用，根据元数据动态渲染界面。
- **系统字段（System Fields）**：由平台内核自动创建和维护的字段，存在于所有对象中（如 `uid`, `created_on`）。
- **标准字段（Standard Fields）**：系统预置对象中的默认业务字段（如 `record_type`, `email`, `username`）。
- **自定义字段（Custom Fields）**：用户根据业务需求创建的字段 (Field.source == 'custom')。
- **页面布局（PageLayout）**： 定义对象详情页和编辑页的字段分组与顺序。它可能表达在 Admin Console 中的布局配置，也可能体现在 Runtime App 中的页面渲染。
- **列表视图（PageList）**：定义对象列表页显示的列和筛选条件。它可能表达在 Admin Console 中的列表配置，也可能体现在 Runtime App 中的页面渲染。
- **Seed（种子数据/初始化）**：系统初始化的过程，用于向数据库注入必要的元数据（如系统对象、字段）和基础业务数据，通常在开发环境或系统重置时执行。

## Dev Tips

### 1. Python 后端

- 进入 backend 目录并使用 `uv run` 运行 Python 程序或脚本；
- 开发新 feature 如何涉及到 DB 结构变更，不需要考虑 DB 迁移的工作，只需要确保在执行 seed db 后能够正确初始化正确的表结构即可；

### 2. React 前端

- 单元/组件测试遵循"就近原则"（.test.tsx 放在源码目录下），集成/E2E 测试放在 `frontend/tests/` 目录
- 优先使用 MUI 组件而非原生 HTML

### 3. 测试

- **运行方式**: 后端使用 `make backend-test`，前端使用 `make frontend-test`，如果需要运行特定测试文件，可以进入对应目录后使用 `uv run pytest` 或 `npm run test` 命令；
- **前端测试 Hook 陷阱**：避免在组件 Props 解构时使用对象字面量作为默认值（如 `props = {}`），这会导致 `useEffect` 无限循环。应在组件外部定义常量作为默认值；
- **前端测试额外参数**: 测试运行时需要添加 `--run` 参数，避免测试无法结束；

### 4. 文档查询

- 查阅第三方类库文档时，使用 context7 相关工具

## 其他文档

- docs/arch.md - 系统架构设计文档，包含技术栈、数据存储策略、元数据核心概念、字段类型等内容；
