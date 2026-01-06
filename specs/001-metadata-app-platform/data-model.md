# Data Model: 元数据引擎核心模型

## 核心元数据表 (Metadata Tables)

这些表由 SQLAlchemy ORM 静态定义 (`backend/app/db/models.py`)。

### 1. `meta_objects` (自定义对象定义)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 对象唯一标识 |
| `name` | String | Unique, Not Null | API 唯一标识名 (e.g., `cust_order`) |
| `label` | String | Not Null | 显示名称 (e.g., "销售订单") |
| `description` | Text | | 描述 |
| `source` | String | Not Null | 来源: `system` (系统预置) 或 `custom` (用户定义) |
| `created_at` | DateTime | | |

### 2. `meta_fields` (自定义字段定义)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 字段唯一标识 |
| `object_id` | UUID | FK -> meta_objects.id | 所属对象 |
| `name` | String | Not Null | 字段 API 标识 (e.g., `order_amount`) |
| `label` | String | Not Null | 显示标签 |
| `data_type` | String | Not Null | 类型: `Text`, `Number`, `Date`, `Boolean`, `Picklist`, `Lookup`, `Metadata` |
| `options` | JSON | | 选项值(Picklist), 关联配置(Lookup), 或 引用元数据类型(Metadata) |
| `is_required` | Boolean | Default False | 是否必填 |
| `source` | String | Not Null | 来源: `system` (系统预置) 或 `custom` (用户定义) |

*Constraint*: `(object_id, name)` 必须唯一。

### 3. `meta_roles` (角色定义 - Metadata)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | String | Unique, Not Null | 角色标识 (e.g., `admin`, `sales_rep`) |
| `label` | String | Not Null | 显示名称 |
| `description` | Text | | |
| `permissions` | JSON | | 权限配置 (Object-level CRUD) |
| `source` | String | Not Null | 来源: `system` (系统预置) 或 `custom` (用户定义) |

### 4. `meta_page_layouts` (页面布局)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `object_id` | UUID | FK -> meta_objects.id | 所属对象 |
| `name` | String | | 布局名称 |
| `layout_config` | JSON | Not Null | 布局结构 JSON |
| `source` | String | Not Null | 来源: `system` (系统预置) 或 `custom` (用户定义) |

### 5. `meta_list_views` (列表视图)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `object_id` | UUID | FK -> meta_objects.id | 所属对象 |
| `name` | String | | 视图名称 |
| `columns` | JSON | Not Null | 显示的字段 name 列表 |
| `filter_criteria` | JSON | | 筛选条件 |
| `source` | String | Not Null | 来源: `system` (系统预置) 或 `custom` (用户定义) |

---

## 动态业务数据表 (Dynamic Data Tables)

对于每个在 `meta_objects` 中定义的对象 (例如 `name = 'cust_lead'`)，系统将维护一个对应的物理表。

### 表命名规则
`data_{name}` (全小写)

### 标准字段 (所有业务表默认包含)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, AutoIncrement | 内部物理主键 (性能优化) |
| `uid` | UUID | Unique, Not Null | 外部公开主键 (API交互使用) |
| `created_at` | DateTime | | 创建时间 |
| `updated_at` | DateTime | | 最后更新时间 |
| `owner_id` | Integer | FK -> data_user.id | 关联 `data_user` 表 (内部ID) |

### 动态字段映射 (Python/SQLite)

| Metadata Type | SQLite Column | Python Type (Pydantic) | Notes |
| :--- | :--- | :--- | :--- |
| `Text` | TEXT | `str` | |
| `TextArea` | TEXT | `str` | |
| `Number` | REAL | `float` | |
| `Boolean` | INTEGER | `bool` | |
| `Date` | TEXT | `datetime.date` | ISO8601 String |
| `Picklist` | TEXT | `str` | |
| `Lookup` | INTEGER | `int` | Stores Target Record ID (Int PK) |
| `Metadata` | TEXT | `str` | Stores Target Metadata **Name** |

## 系统预置对象 (System Objects Seeding)

### 1. User (`data_user`)
- **Fields**: 
  - `name` (Text)
  - `email` (Text)
  - `role` (Metadata): Type=`Metadata`, References=`meta_roles`. Value=`admin` (string).
