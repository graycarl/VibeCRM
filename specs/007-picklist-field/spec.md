<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: 完善 Picklist 类型字段实现

**Feature Branch**: `007-picklist-field`  
**Created**: 2026-01-11  
**Status**: Draft  
**Input**: User description: "完善 Picklist 类型字段的实现。需要能够在 Admin Console 中定义选项，选项包含 name 和 label。Runtime app 创建和更新数据时，需要校验选项是否在预定义的 option 范围内。Runtime App 在展示 picklist 内容时应该按 label 来展示，编辑字段时，应该按 label 展示下拉选项供选择。seed data 中为 Account 对象添加 sex 字段，类型为 picklist；"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 管理员定义 Picklist 字段选项 (Priority: P1)
管理员在 Admin Console 创建或编辑字段时，如果选择类型为 Picklist，可以输入一系列选项。每个选项包含一个“API 名称 (Name)”和一个“显示标签 (Label)”。

**Why this priority**: 这是 Picklist 字段的基础，没有选项定义，后续的展示和校验都无法进行。

**Independent Test**: 可以通过 Admin Console 创建一个 Picklist 字段并保存多个选项，然后重新打开编辑界面确认选项已正确保存。

**Acceptance Scenarios**:
1. **Given** 管理员正在创建一个新字段，**When** 选择类型为 "Picklist"，**Then** 界面应出现“管理选项”的入口或列表。
2. **Given** 选项编辑界面，**When** 输入选项 A (Name: male, Label: 男) 和选项 B (Name: female, Label: 女) 并保存，**Then** 该字段的元数据应包含这些配置。

---

### User Story 2 - 用户在运行时应用中使用 Picklist 字段 (Priority: P1)
终端用户在创建或编辑记录时，Picklist 类型的字段应显示为下拉选择框，下拉框中的选项应显示 Label，而保存到数据库的值应为对应的 Name。

**Why this priority**: 这是该功能的核心交互，确保用户能够通过预定义的选项录入数据。

**Independent Test**: 打开 Account 记录的创建页面，查看 "性别" 字段是否为下拉框，并确认下拉内容为“男”和“女”。

**Acceptance Scenarios**:
1. **Given** 用户打开记录创建表单，**When** 点击 Picklist 字段，**Then** 系统应展示该字段定义的所有选项的 Label。
2. **Given** 用户选择了一个选项并提交，**When** 数据保存成功后，**Then** 后端存储的值应为该选项的 Name。

---

### User Story 3 - Picklist 数据展示与校验 (Priority: P2)
在列表页或详情页查看记录时，Picklist 字段应显示对应的 Label。在提交数据时，后端应校验所选值是否在定义的范围内。

**Why this priority**: 提高数据的可读性并保证数据的完整性。

**Independent Test**: 尝试通过 API 发送一个不在选项范围内的值，确认后端返回校验错误。

**Acceptance Scenarios**:
1. **Given** 数据库中某记录的 Picklist 字段值为 "male"，**When** 在列表页查看时，**Then** 该列应显示“男”。
2. **Given** 后端接收到创建请求，**When** 字段值为 "unknown"（不在选项定义中），**Then** 系统应返回 400 错误并提示值无效。

---

### Edge Cases
- **选项列表为空**: 如果 Picklist 字段没有定义任何选项，表单应显示为空的下拉框并提示“未配置选项”。
- **选项重名**: 系统应在元数据层面禁止在同一个字段下定义具有相同 Name 的选项。允许不同的 Name 具有相同的 Label。

## Clarifications

### Session 2026-01-11
- Q: 删除正在使用的选项时如何处理？ → A: 强制用户选择迁移目标（新选项或清空）并同步更新业务数据。
- Q: 下拉选项的排序规则是什么？ → A: 按管理员在元数据中定义的顺序。
- Q: 是否允许重复的显示标签 (Label)？ → A: 允许（只要 Name 唯一）。
- Q: 是否支持多选 (Multi-select)？ → A: 仅支持单选。
- Q: 非必填 Picklist 字段的交互逻辑？ → A: 依靠 Select 组件自带的清除功能。
- Q: 是否支持设置默认值？ → A: 不支持，初始值始终为空。
- Q: 是否支持下拉选项搜索过滤？ → A: 支持搜索过滤（使用 Autocomplete 组件）。
- Q: 迁移后的历史数据展示逻辑？ → A: 不记录，仅展示迁移后的新值。
- Q: 选项 API 名称 (Name) 的字符校验？ → A: 严格限制：仅限小写字母、数字和下划线，不能数字开头。
- Q: 选项配置的保存机制？ → A: 实时保存（独立提交每个选项的变更）。
- Q: Picklist 选项的 JSON 存储结构是什么？ → A: 对象数组：`[{"name": "...", "label": "..."}]`。

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Admin Console 必须支持为 Picklist 类型字段配置选项列表，每个选项必填 `name` 和 `label`。
- **FR-002**: Runtime App 的动态表单必须将 Picklist 字段渲染为 Material UI 的 Select 或 Autocomplete 组件。
- **FR-003**: UI 组件必须显示选项的 `label`，并将选中的 `name` 作为表单值提交。
- **FR-004**: 数据展示组件（DataGrid/Detail）必须根据元数据将 Picklist 的 `name` 映射回 `label` 进行显示。
- **FR-005**: 后端在处理记录创建和更新请求时，必须校验 Picklist 字段的值是否存在于该字段定义的 `options` 列表中。
- **FR-006**: 系统预置的 Seed 数据应包含 `Account` 对象的 `sex` 字段，选项包含 `male: 男` 和 `female: 女`。
- **FR-007**: Picklist 的选项列表应以 JSON 数组形式存储在 `MetaField.options` 中，格式为 `[{"name": "...", "label": "..."}]`。
- **FR-008**: 本次实现仅支持单选列表（Single-select Picklist），不支持多选。
- **FR-009**: 对于非必填（is_required: false）的 Picklist 字段，UI 应提供清除功能允许用户将值设为空。
- **FR-010**: Picklist 字段暂不支持设置默认值，新建记录时该字段初始值始终为空。
- **FR-011**: 运行时应用的 Picklist 组件应支持搜索过滤功能（建议使用 Autocomplete 组件）。
- **FR-012**: 选项的 API 名称（Name）仅允许小写字母、数字和下划线，且不能以数字开头。
- **FR-013**: 选项配置采用实时保存机制，添加、删除或修改选项后立即向后端发起请求。

### Non-Functional Requirements
- **PERF-001**: 选项映射转换（Name to Label）应在前端高效处理，不应显著增加页面渲染时间。
- **SEC-001**: 后端校验必须是强制性的，不依赖于前端的下拉限制。

### UX/UI Consistency
- **UX-001**: Picklist 的下拉样式必须与系统中现有的 Material UI 风格保持一致。
- **UX-002**: 选项配置界面应支持添加、删除和通过拖拽或按钮调整顺序。

### Key Entities
- **Picklist Option**: Picklist 字段元数据的一部分。
  - `name`: 存储值（API 标识符）。
  - `label`: UI 显示文本。
  - **Storage**: 存储在 `MetaField.options` JSON 字段中的对象数组成员。

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 管理员可以在 30 秒内为一个新字段完成 3 个选项的配置。
- **SC-002**: 用户在表单中选择选项后，保存操作的成功率为 100%（只要选项有效）。
- **SC-003**: 后端拦截 100% 的非预定义 Picklist 值的非法请求。
- **SC-004**: 所有 Picklist 字段在展示时均正确映射为 Label，无原始 Name 泄露到用户界面。
