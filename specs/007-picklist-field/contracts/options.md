# API Contracts: Picklist Option Management

## 1. 添加选项
- **Endpoint**: `POST /api/meta/fields/{field_id}/options`
- **Request Body**:
  ```json
  {
    "name": "new_option",
    "label": "新选项"
  }
  ```
- **Response**: `201 Created`
- **Constraints**: 校验 `name` 唯一性及格式。

## 2. 更新选项
- **Endpoint**: `PATCH /api/meta/fields/{field_id}/options/{name}`
- **Request Body**:
  ```json
  {
    "label": "修改后的标签"
  }
  ```
- **Response**: `200 OK`
- **Side Effect**: 更新元数据。

## 3. 删除选项 (含迁移)
- **Endpoint**: `DELETE /api/meta/fields/{field_id}/options/{name}`
- **Query Params**:
  - `migrate_to`: `string` (可选) - 迁移目标选项的 `name`。如果不提供或为空，则将现有数据清空。
- **Response**: `200 OK`
- **Side Effect**: 
  1. 从元数据中移除该选项。
  2. 扫描并更新物理表中所有使用该 `name` 的记录。

## 4. 获取选项 (已集成在 MetaField 中)
- **Endpoint**: `GET /api/meta/objects/{object_name}`
- **Behavior**: 返回的字段列表中包含 `options` 数组。
