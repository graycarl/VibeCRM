# Research: 元数据应用平台技术选型

**Date**: 2026-01-07
**Status**: Finalized

## 1. 数据库选型 (Database Strategy)

### Decision
采用 **SQLite** 配合 **SQLAlchemy (Synchronous)**。

### Rationale
1.  **简化的编程模型**：使用同步 I/O 避免了 AsyncIO 带来的传染性 (`async/await`) 和潜在的 Event Loop 阻塞问题。
2.  **混合模式 (Hybrid approach)**：
    - **元数据表 (`meta_*`)**：使用 SQLAlchemy ORM (Session) 进行强类型管理。
    - **动态业务表 (`data_*`)**：使用 SQLAlchemy Core (Connection) 执行同步 DDL 和动态 SQL 查询。
3.  **FastAPI 兼容性**：FastAPI 完美支持同步路由函数 (`def path_op(): ...`)，它会自动在 ThreadPool 中运行这些函数，确保主 Event Loop 不被阻塞。

### Primary Key Strategy (New)
为了兼顾数据库性能（B-Tree 索引效率）和分布式/API 安全性，**业务表 (`data_*`)** 将采用双主键策略：
- **`id` (Integer AutoInc)**: 作为物理主键 (Clustered Index in some DBs, though SQLite is RowID based usually)，用于内部关联 (Foreign Keys) 和分页游标。
- **`uid` (UUID)**: 作为逻辑主键，用于 API 路径参数和外部系统交互，避免暴露业务量级。

## 2. 动态表单渲染 (Frontend Dynamic Rendering)

### Decision
采用 **React Hook Form** + **MUI** + **递归组件工厂 (Component Factory)**。

### Rationale
1.  **元数据驱动**：前端将接收 JSON 格式的 Page Layout 配置。
2.  **组件映射**：建立 `FieldType -> ReactComponent` 的映射表（例如 `Text -> TextField`, `Picklist -> Select`）。
3.  **验证集成**：利用 React Hook Form 的 schema validation 与后端返回的 Field Metadata（必填、最大长度等）进行动态绑定。

## 3. 动态数据 API 设计 (Dynamic Data API)

### Decision
采用 **FastAPI** + **Dynamic Pydantic Models**。

### Rationale
1.  **动态路由**：使用泛型路由路径 `/api/v1/data/{object_name}`。
2.  **动态验证**：利用 Pydantic 的 `create_model` 工厂函数，根据 Metadata 在运行时动态构建 Pydantic Model。这能让 FastAPI 自动处理 Request Body 的验证，并自动生成 OpenAPI Schema。

## 4. 系统对象与元数据结构更新

### Decision
- **Role 升级为 Metadata**：Role 定义存储于 `meta_roles`。
- **字段重命名**：在所有 Metadata 表中，统一使用 `name` 替代 `api_name`。
- **Metadata 字段类型**：引入 `Metadata` 字段类型，用于在业务数据 (`data_`) 中引用元数据记录（如 Role）。
- **Source 字段**：引入 `source` (enum: `system`, `custom`) 到所有元数据表，替代 `is_system` 布尔字段。
    - `system`: 系统核心定义，受保护不可删除。
    - `custom`: 用户自定义，可自由变更。

### Rationale
- **Role as Metadata**: Role 决定了权限配置（Profile），属于系统配置的一部分。
- **Reference by Name**: 元数据通常在不同环境中迁移（Dev -> Prod），ID 可能变化，但 Name (API Name) 是稳定的标识符。因此 `Metadata` 类型的字段存储 Name 更利于配置迁移。
- **Source Attribute**: `source` 字段提供了更明确的来源标识，未来可扩展支持 `package` (来自安装包) 等其他来源，比单一的 `is_system` 更具扩展性。