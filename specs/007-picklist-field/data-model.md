# Data Model: Picklist Field Specification

## MetaField (Metadata)
`MetaField` 实体中的 `options` 列存储 Picklist 的定义。

- **Column**: `options` (JSON)
- **Structure**: `List[Dict[str, str]]`
- **Validation**:
  - 每个对象必须包含 `name` 和 `label`。
  - 同一字段下的 `name` 必须唯一。
  - `name` 格式校验：`^[a-z_][a-z0-9_]*$`。
  - `label` 允许重复。

### Example Storage
```json
[
  {"name": "male", "label": "男"},
  {"name": "female", "label": "女"}
]
```

## Runtime Data Storage
Picklist 字段的值在物理表（如 `data_account`）中以 `TEXT` 类型存储。

- **Storage Value**: 选项的 `name`。
- **Empty State**: `NULL`。

## Relationship
Picklist 字段目前为**自包含**数据模型，不涉及跨表外键，但其值的合法性依赖于对应的 `MetaField.options` 定义。
