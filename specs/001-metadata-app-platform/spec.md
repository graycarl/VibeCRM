<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: 元数据驱动应用开发平台 (Metadata Driven App Platform)

**Feature Branch**: `001-metadata-app-platform`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "帮我实现一个类似 Salesforce 的应用开发平台，包含 Metadata Driven 的对象定义，可配置的列表页面和 Layout 页面来维护数据，以及用于配置 Metadata 的 Admin Console。"

## Clarifications

### Session 2026-01-07
- Q: Data storage strategy for custom objects? → A: Table Per Object (Physical table per CustomObject).
- Q: Object relationship support for MVP? → A: Simple Lookup (1:N reference).
- Q: Primary API protocol for metadata and records? → A: REST API (JSON).
- Q: Search and filtering capabilities for records? → A: Keyword & Filters (Exact/Prefix match).
- Q: Security & Permissions model? → A: Dynamic Roles (Object-level CRUD).
- Q: Conflict resolution for concurrent record edits? → A: Last Writer Wins (Simple overwrite).
- Q: Metadata schema update execution? → A: Synchronous (Atomic DDL).
- Q: Implementation strategy for System Objects (User, Role)? → A: Pre-seeded Metadata (Defined as CustomObjects, seeded at startup).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 管理员定义业务对象与字段 (Priority: P1)

作为系统管理员，我希望能够定义新的业务对象（如“客户”、“订单”）并为其添加不同类型的字段（如文本、数字、日期、下拉列表），以便系统能够适应不同的业务数据存储需求。

**Why this priority**: 这是平台的基础能力，只有定义了元数据（Metadata），后续的数据录入和页面展示才有意义。

**Independent Test**:
- 管理员可以在 Admin Console 中创建一个名为“TestObject”的对象。
- 管理员可以为“TestObject”添加文本字段“Name”和数字字段“Amount”。
- 系统能够持久化保存这些元数据定义。

**Acceptance Scenarios**:

1. **Given** 管理员登录 Admin Console, **When** 点击“新建对象”并输入对象名称和API Name, **Then** 系统保存对象定义并在列表中显示。
2. **Given** 已存在的对象定义, **When** 管理员添加一个“单选列表”类型的字段并定义选项值, **Then** 该字段定义被成功保存，且包含选项值元数据。
3. **Given** 现有对象, **When** 管理员删除一个字段, **Then** 该字段定义从元数据中移除。

---

### User Story 2 - 终端用户通过动态布局管理数据 (Priority: P1)

作为终端用户，我希望通过系统自动生成的页面来创建、查看和编辑业务记录，以便我不需要开发人员介入就能进行业务数据管理。

**Why this priority**: 这是产品的核心价值体现，验证了“元数据驱动”的界面渲染能力。

**Independent Test**:
- 针对 User Story 1 创建的“TestObject”，普通用户可以看到自动生成的“新建”和“详情”页面。
- 用户输入数据并保存，数据被正确写入数据库。
- 页面输入控件应根据字段类型自动适配（如日期字段显示日期选择器）。

**Acceptance Scenarios**:

1. **Given** 定义好的对象和字段, **When** 用户访问该对象的“新建”页面, **Then** 系统根据元数据渲染出包含所有字段的表单。
2. **Given** 填写完毕的表单, **When** 用户点击保存, **Then** 数据被验证（如必填检查）并存入数据库，随后跳转至详情页。
3. **Given** 已存在的记录, **When** 用户访问详情页, **Then** 页面以只读方式展示所有字段的值。

---

### User Story 3 - 管理员配置列表视图与页面布局 (Priority: P2)

作为管理员，我希望能够自定义对象的列表视图（显示哪些列）和详情页布局（字段的分组和顺序），以便让终端用户看到最相关的信息，优化操作体验。

**Why this priority**: 提供定制化能力，区分于简单的数据库管理工具，提升用户体验。

**Independent Test**:
- 管理员修改“TestObject”的默认列表视图，仅展示“Name”字段。
- 管理员修改详情页Layout，将“Amount”字段移动到顶部。
- 终端用户访问列表和详情页时，界面反映上述变更。

**Acceptance Scenarios**:

1. **Given** 包含多个字段的对象, **When** 管理员创建一个新的列表视图并选择显示其中3个字段, **Then** 终端用户在列表页只能看到这3个被选中的列。
2. **Given** 对象详情页布局配置, **When** 管理员调整字段在Layout中的顺序并保存, **Then** 终端用户的详情页/编辑页立即按新顺序显示字段。

---

### Edge Cases

- **并发编辑冲突**: 当两个用户同时编辑同一条记录时，系统采用 **Last Writer Wins** 策略，即后保存的修改将覆盖先保存的修改。
- **元数据变更对现有数据的影响**: 当管理员删除一个包含数据的字段时，系统应如何处理现有数据？（MVP建议：逻辑删除或提示警告）。
- **字段类型变更**: 如果将文本字段改为数字字段，现有非数字数据如何处理？（MVP建议：禁止有数据的字段更改不兼容类型，或简单的类型转换）。
- **无效的元数据**: 如果配置了不存在的引用或错误的校验规则，前端应有容错处理，不致白屏。

## Requirements *(mandatory)*

### Functional Requirements

#### 元数据管理 (Admin Console)
- **FR-001**: 系统必须提供 Admin Console 界面，允许管理员查看所有自定义对象。
- **FR-002**: 系统必须支持创建、更新、删除自定义对象（Custom Object），包含 Label（显示名）和 API Name（唯一标识）。此类操作必须**同步执行**底层数据库架构变更（DDL），确保元数据与物理存储即时一致。
- **FR-003**: 系统必须支持为对象添加自定义字段（Custom Field），支持的数据类型至少包括：文本(Text)、长文本(TextArea)、数字(Number)、日期(Date)、复选框(Boolean)、单选列表(Picklist)、查找关系(Lookup)。
- **FR-004**: 系统必须支持配置页面布局（Page Layout），允许管理员定义字段在详情/编辑页面的显示顺序和分组。
- **FR-005**: 系统必须支持配置列表视图（List View），允许管理员定义在数据列表页显示的字段列及其顺序，并支持配置基础的筛选条件。

#### 数据运行时 (Runtime App)
- **FR-006**: 系统必须根据 FR-005 定义的列表视图配置，动态渲染对象的数据列表页面，支持分页、关键字搜索（前缀匹配）和字段过滤。
- **FR-007**: 系统必须根据 FR-004 定义的页面布局，动态渲染对象的创建和编辑表单。
- **FR-008**: 系统必须根据 FR-004 定义的页面布局，动态渲染对象的详情展示页面。
- FR-009: 系统必须根据字段元数据（类型、必填属性等）在前端进行基础的数据校验。
- **FR-010**: 系统必须采用 **Table-Per-Object** 策略，为每个自定义对象在数据库中创建独立的物理表，用于存储该对象的业务记录。
- **FR-011**: 系统必须提供 RESTful API，支持对元数据（对象、字段、布局）和业务记录进行标准的 CRUD 操作。
- **FR-012**: 系统必须支持基于角色的权限控制 (RBAC)。**MVP阶段**: 角色（Admin, User）与权限为系统预置（Static/Seeded），暂不提供界面配置。系统需在后端服务层实现基于当前用户角色的权限检查。
- **FR-013**: 系统初始化时必须自动“预播种”（Pre-seed）核心系统对象（如 User, Role, Position）的元数据定义和物理表，使其在管理控制台中表现为可扩展的 Standard Objects。

### Non-Functional Requirements

- **PERF-001**: 元数据变更（如添加字段）后，终端用户刷新页面应立即生效，无需重启服务。
- **UX-001**: Admin Console 应与终端用户应用界面风格统一，但有清晰的功能区分。
- **UX-002**: 动态生成的表单应响应式布局，适配桌面端浏览器。

### Key Entities

- **CustomObject**: 定义对象的元数据（ID, Label, API Name, Description）。包含 System Objects（如 User）和 Custom Objects。
- **CustomField**: 定义字段的元数据（ID, Object ID, Label, API Name, Type, Options, Required, TargetObjectID）。
- **PageLayout**: 定义对象页面的布局结构（ID, Object ID, Sections, Field Positioning）。
- **ListView**: 定义列表视图配置（ID, Object ID, Columns, Filters）。
- **Record**: 实际的业务数据记录，存储于对象对应的物理表中，结构随 CustomObject 动态变化。
- **Roles**: 定义用户角色配置（ID, Name, Description）。
- **ObjectPermission**: 定义角色对特定对象的权限（ID, Roles ID, Object ID, AllowRead, AllowCreate, AllowEdit, AllowDelete）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 管理员能够在 5 分钟内从零定义一个包含 5 个不同类型字段的“请假申请”对象。
- **SC-002**: 定义完对象后，终端用户能够立即（< 10秒内）访问该对象的列表和新建页面。
- **SC-003**: 能够成功创建、读取、更新、删除（CRUD）至少 1000 条自定义对象记录，且数据准确无误。
- **SC-004**: 在列表页面加载 50 条记录的响应时间小于 1 秒（不含网络延迟）。
