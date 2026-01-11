# Research: Picklist Field Implementation Decisions

## Decision 1: UI Component Selection for Runtime App
- **Decision**: 使用 Material UI 的 `Autocomplete` 组件。
- **Rationale**: 规格要求支持搜索功能（FR-011）。`Autocomplete` 相比标准 `Select` 在选项较多时有更好的交互体验。
- **Alternatives considered**: 
  - `Select` with search: 需要自定义实现过滤逻辑。
  - 标准 `Select`: 不满足搜索过滤要求。

## Decision 2: Backend Validation Strategy
- **Decision**: 在 `DataService` 的 `create_record` 和 `update_record` 方法中，通过查询元数据进行范围校验。
- **Rationale**: 保证数据一致性（FR-005），并遵循 SEC-001。
- **Implementation Detail**: 针对 Picklist 类型的字段，从 `MetaField.options` 中提取所有 `name` 构成合法集合。

## Decision 3: Option Deletion and Migration Logic
- **Decision**: 接口 `DELETE /api/meta/fields/{id}/options/{name}` 接受 `migrate_to` 参数。
- **Rationale**: 解决删除正在使用的选项时的逻辑一致性问题。`migrate_to` 可以是另一个 `name` 或者 `null`（清空）。
- **Alternatives considered**: 
  - 禁止删除：体验较差。
  - 允许删除但不处理历史数据：会导致展示映射失败，显示原始 Name。

## Decision 4: Seed Data Format
- **Decision**: 在 `meta.yml` 中直接定义 `options` 数组。
- **Rationale**: 与元数据存储结构保持一致（FR-007）。
- **Example**:
  ```yaml
  - name: sex
    label: 性别
    type: picklist
    options:
      - name: male
        label: 男
      - name: female
        label: 女
  ```
