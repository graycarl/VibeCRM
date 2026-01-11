<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: 添加 Datetime 字段类型及系统对象时间戳

**Feature Branch**: `006-add-datetime-field`  
**Created**: 2026-01-11  
**Status**: Draft  
**Input**: User description: "添加 Datetime 类型字段实现，并为 User 和 Account 这两个 system object 添加 created_at 字段。created_at 字段需要在 PageList 中暂时，并在 PageLayout 中只读展示。"

## Clarifications

### Session 2026-01-11

- Q: 时区处理策略? → A: 数据库存储 UTC (ISO8601) 字符串，前端自动转换并显示为用户本地时间。
- Q: 前端 Datetime 输入组件? → A: 使用原生 `<TextField type="datetime-local">`。
- Q: 只读字段展示方式? → A: 使用禁用的输入框 (Disabled Input Field) 以保持布局一致性。
- Q: 后端对 created_at 字段的写保护策略? → A: 在 API Schema 层将 `created_at` 标记为只读，确保 API 忽略任何传入的该字段值。
- Q: created_at 字段的适用范围? → A: 将 `created_at` 作为所有对象（包括自定义对象）的默认标准字段，统一数据模型。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 支持 Datetime 字段类型 (Priority: P1)

管理员可以在创建自定义对象字段时选择 Datetime 类型，并在记录中保存和查看日期时间数据。

**Why this priority**: 这是实现系统对象时间戳的基础能力，也是通用的业务需求。

**Independent Test**: 可以独立创建一个包含 Datetime 字段的自定义对象，并验证记录的增删改查功能。

**Acceptance Scenarios**:

1. **Given** 管理员进入字段创建页面, **When** 选择字段类型, **Then** 下拉列表中包含 "Datetime" 选项。
2. **Given** 一个包含 Datetime 字段的对象, **When** 用户创建记录并选择日期时间, **Then** 该记录成功保存，且再次查看时显示正确的日期和时间。
3. **Given** 记录列表页, **When** 显示 Datetime 字段, **Then** 以用户友好的格式（如 YYYY-MM-DD HH:mm）展示。

---

### User Story 2 - 系统对象自动记录创建时间 (Priority: P1)

User 和 Account 系统对象在创建记录时，自动记录创建时间到 created_at 字段。

**Why this priority**: 满足审计和记录追踪的基本需求，也是本需求的核心目标。

**Independent Test**: 创建一个新的 User 或 Account，检查数据库或通过 API 查看其 created_at 字段是否有值。

**Acceptance Scenarios**:

1. **Given** 系统初始化或更新后, **When** 查看 User 和 Account 的元数据定义, **Then** 它们包含名为 `created_at` 类型为 `Datetime` 的字段。
2. **Given** 新建 User 或 Account 的流程, **When** 记录被保存, **Then** `created_at` 字段被自动填充为当前时间。

---

### User Story 3 - 在界面中查看创建时间 (Priority: P2)

用户可以在 User 和 Account 的列表页及详情页查看创建时间，但不可修改。

**Why this priority**: 提供数据的可视化展示，提升用户体验。

**Independent Test**: 在前端界面浏览 User/Account 列表和详情页。

**Acceptance Scenarios**:

1. **Given** User 或 Account 列表页, **When** 页面加载, **Then** 表格中包含 "Created At" (或类似标签) 列，并显示时间。
2. **Given** User 或 Account 详情页, **When** 页面加载, **Then** 显示 "Created At" 字段。
3. **Given** User 或 Account 编辑页, **When** 尝试修改 "Created At", **Then** 该字段为只读状态或不可编辑。

---

### Edge Cases

- **原有数据处理**: 系统中已存在的 User/Account 记录，在字段添加后 `created_at` 是否为空或需填充默认值？(Assumption: 新增字段允许为空，或在迁移时填充默认值，本需求主要关注新功能，旧数据可为空或脚本处理)。
- **时区问题**: 系统统一采用 UTC 时间存储，前端根据用户本地时区进行展示。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 元数据系统 (Metadata System) 必须支持 `Datetime` 作为一种 `MetaField` 的 `data_type`。
- **FR-002**: 数据库层必须存储 UTC 格式 (ISO8601) 的 `Datetime` 数据，以确保跨时区的一致性。
- **FR-003**: 所有对象 (包括 System Objects 和 Custom Objects) 都必须包含 `name="created_at"`、`data_type="Datetime"` 的标准系统字段。
- **FR-004**: 在创建任何对象的记录时，后端服务必须自动将 `created_at` 设置为当前服务器时间 (UTC)，并忽略请求体中可能存在的该字段。
- **FR-005**: 所有对象的默认列表视图 (ListView) 配置应包含 `created_at` 列 (具体展示可配置)。
- **FR-006**: 所有对象的默认页面布局 (PageLayout) 应包含 `created_at` 字段。
- **FR-007**: 前端动态表单 (DynamicForm) 针对 `Datetime` 类型字段必须提供日期时间选择器组件 (采用原生 `type="datetime-local"`)。
- **FR-008**: 前端必须将 `created_at` 字段在编辑模式下渲染为禁用的输入框 (Disabled Input Field)，以保持界面布局一致。
- **FR-009**: 在更新 (Update/Patch) 记录时，后端 API Schema 必须严格过滤或忽略 `created_at` 字段，禁止任何形式的修改。

### Non-Functional Requirements

- **PERF-001**: 添加 `created_at` 字段不应显著影响对象的查询性能。
- **UX-001**: 日期时间显示格式应清晰易读 (建议 `YYYY-MM-DD HH:mm:ss`)，并转换为用户本地时区。

### UX/UI Consistency

- **UX-002**: Datetime 选择器组件应使用原生 `datetime-local` 类型，风格与现有 Date 选择器保持一致。
- **UX-003**: 只读字段应采用禁用的输入框样式，确保视觉表现符合系统统一的禁用状态规范。

### Key Entities

- **MetaField**: 新增 `Datetime` 枚举支持。
- **All Objects**: 所有元数据对象现在默认包含 `created_at` 属性。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 管理员可在元数据配置中成功创建并保存类型为 `Datetime` 的自定义字段。
- **SC-002**: 新创建的 User 和 Account 记录，其 `created_at` 字段值与创建时间误差在允许范围内 (如 1秒内)。
- **SC-003**: 在 User 和 Account 的列表页，100% 的新记录都能显示创建时间。
- **SC-004**: 在 User 和 Account 的编辑页，用户无法修改 `created_at` 字段的值。