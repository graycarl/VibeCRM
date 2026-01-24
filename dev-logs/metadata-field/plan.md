# Metadata Field 实现方案

## 1. 需求理解
- 新增 Metadata Field 数据类型，行为类似 Lookup Field，但引用平台所有元数据实体。
- 字段定义中新增 `metadata_name` 属性，创建时通过统一选择器选择目标元数据。
- 业务数据中存储目标 metadata 的 `name`；若引用对象字段或记录类型，值采用 `<object_name>.<field_name>` / `<object_name>.<record_type_name>`。
- 前端展示直接读取后端返回的 `<field>__label`，若目标已删除则显示“已删除”。

## 2. 影响范围
1. **后端**
   - `MetaField` 模型、Schema、创建/更新逻辑。
   - Metadata 映射服务、校验与 enrichment。
   - 新增 metadata selector API。
2. **前端 Admin Console**
   - Field 创建/编辑对话框支持 Metadata 类型及 selector UI。
3. **前端 Runtime**
   - `DynamicForm`、`DynamicDataGrid` 等组件渲染 Metadata Field。
4. **测试**
   - 后端单测、前端组件测试。

## 3. 实现步骤
### 3.1 后端
1. **模型与 Schema 更新**
   - `MetaField` 表及 Pydantic schema 新增 `metadata_name` 字段。
   - Metadata Field（`data_type == "Metadata"`）校验：必须提供 `metadata_name`；其他类型禁止设置该属性。

2. **Metadata 映射**
   - 在 `meta_service` 中构建全量 metadata map：
     - 对象：`{name: label}`
     - 对象字段：`{f"{obj.name}.{field.name}": f"{obj.label}.{field.label}"}`
     - 记录类型：`{f"{obj.name}.{rt.name}": f"{obj.label}.{rt.label}"}`
     - 其它 metadata（布局、列表等）：`{name: label}`
   - 提供缓存/刷新机制供 API 和数据服务使用。

3. **数据校验与 enrichment**
   - `_validate_data`：Metadata Field 值需存在于 metadata map；允许为空。
   - `_enrich_metadata_fields`：对记录批量填充 `<field>__label`。
     - 找不到时填入 "已删除"。
   - 在 `get_record` / `list_records` 中调用。

4. **API**
   - 新增 `GET /metadata/lookup`：返回 selector 数据，包含 `value`（存储用 name）与 `label`（展示文本）。

### 3.2 前端 Admin Console
1. `FieldCreateDialog`：
   - 当数据类型为 Metadata 时显示 selector；调用新 API 获取列表。
   - 选择器显示 `label`，保存 `value` 到 `metadata_name`。
   - 编辑模式下禁止修改 `metadata_name`。

2. Selector 组件：
   - 支持搜索过滤，列表展示统一结构（对象字段显示 `ObjectLabel.FieldLabel` 等）。

### 3.3 前端 Runtime
1. `DynamicForm` / `DynamicDataGrid` / 详情页：
   - 渲染 Metadata Field 时以只读文本展示 `lookupLabels[field.name] || value || "已删除"`。
   - 保持与 Lookup Field 一致的状态存储和 label 使用逻辑。

### 3.4 测试
1. **后端**：
   - Metadata Field 创建失败场景（无 metadata_name、引用不存在）。
   - 记录创建/查询时的校验与 enrichment。
2. **前端**：
   - Selector 组件渲染与交互单测。
   - DynamicForm Metadata Field 快照与行为测试。

## 4. 技术要点
- **统一映射**：metadata map 需覆盖所有元数据类型，支持对象子元素的复合 key。
- **一致性**：前后端处理与 Lookup Field 行为保持一致（__label 约定、禁手输、可清空等）。
- **容错**：引用删除时后端返回“已删除”，前端无需额外判断。
- **性能**：metadata map 可缓存，变更后触发刷新，避免频繁扫描数据库。
