# VibeCRM 浏览器端 E2E 测试用例

## 0. 测试前后环境要求

1. **重置数据库与依赖**
   ```bash
   make reset
   ```
   清空并重新 seed 元数据与示例记录，确保测试可重复。

2. **启动服务**
   - 启动 tmux 会话（例如 `tmux new -s vibecrm`），在会话中运行：
     ```bash
     make dev
     ```
     这会同时启动 FastAPI 后端与 React 前端。
   - 测试完成后，按顺序退出 `make dev`、离开 shell，并关闭 tmux：
     ```bash
     Ctrl+C
     exit
     tmux kill-session -t vibecrm
     ```

3. **登录说明**
   当前实现未检查登录状态，可直接访问各页面，E2E 用例中忽略登录流程。

## 1. 功能范围概览

- **Admin Console**：
  - 自定义对象管理（创建、编辑受限、删除、Record Type 配置、name_field 设置）。
  - 字段管理（Text/Number/Date/Datetime/Boolean/Picklist/Lookup，Picklist 选项维护，系统字段受限）。
  - List View / Page Layout 配置（字段列集合、布局排序）。
  - Record Type 选项增删排序。
  - 角色管理（自定义角色创建、删除；系统角色保护）。
- **Runtime 应用**：
  - 对象记录列表（分页、排序、Record Type 新建流程、行内动作）。
  - 记录创建/编辑/详情（DynamicForm、Picklist、Lookup Dialog、Record Type 只读展示、布局渲染、系统字段隐藏）。
  - Lookup Dialog（查询引用对象记录并返回展示 label）。

## 2. 浏览器端 E2E 测试用例

| ID | 名称 | 前置条件 | 步骤 | 期望结果 |
|----|------|---------|------|---------|
| NAV-01 | MainLayout 响应式与导航 | 服务已启动 | 1. 打开 `/admin/objects` 2. 切换窗口尺寸验证 Drawer 行为 | 桌面固定、移动端折叠；菜单链接生效 |
| ADMIN-OBJ-01 | 创建自定义对象（含 Record Type） | 无 | 在 `/admin/objects` 中新建对象，启用 Record Type | 列表新增对象，API Name 自动 `cs_` 前缀，详情展示 Record Type 支持 |
| ADMIN-OBJ-02 | 编辑对象权限限制 | 存在系统对象 | 打开系统对象详情 → Edit | API Name/Record Type 开关禁用，仅允许修改 Label/描述 |
| ADMIN-OBJ-03 | 删除自定义对象 | 存在自定义对象 | 在列表中删除 | 对象被移除，运行时导航同步更新 |
| ADMIN-FLD-01 | 新增 Picklist 字段与选项 | 目标对象存在 | 对象详情 → Add Field → Picklist → 配置选项 | 字段列表出现新字段，Picklist 选项顺序正确 |
| ADMIN-FLD-02 | Lookup 字段创建校验 | 存在被引用对象 | 创建 Lookup 字段，未选引用对象尝试提交 | 弹出提示；选择对象后可保存 |
| ADMIN-FLD-03 | 系统字段编辑限制 | 系统字段存在 | 编辑系统字段 | 仅允许编辑 Label，描述/必填禁用并提示 |
| ADMIN-LIST-01 | 自定义列表视图列 | 有字段 | 进入 List View Editor 选择列并保存 | 保存成功，重新打开配置保持一致 |
| ADMIN-LAYOUT-01 | 页面布局字段排序 | 有字段 | 配置布局并保存，至运行时详情验证顺序 | 详情字段顺序与配置一致 |
| ADMIN-RT-01 | Record Type 选项增删排序 | 对象已启用 record_type | Edit Object 中使用 RecordTypeOptionsEditor | 选项新增/排序/删除立即生效 |
| ADMIN-ROLE-01 | 自定义角色增删 | - | `/admin/roles` 新建角色（JSON 权限），删除 | 自定义角色允许删除，列表更新 |
| APP-LIST-01 | 列表分页与排序 | 对象有多记录 | 访问 `/app/:object`，切换 page size、对 Number/Datetime 列排序 | 请求参数变化，数据按指定排序分页 |
| APP-LIST-02 | Record Type 新建流程 | 对象启用多 Record Types | 在列表页点击“新建” | 弹出 Record Type 选择器，选择后跳转 `?record_type=` 表单 |
| APP-CRUD-01 | 创建记录（含 Picklist/Lookup） | 有对应字段 | 新建记录，填写字段，使用 Lookup Dialog 选择记录 | 保存成功，列表/详情显示 label |
| APP-CRUD-02 | 编辑记录 | - | 列表 → Edit → 修改字段 | 保存成功，记录值更新（详情可见） |
| APP-CRUD-03 | 记录详情布局展示 | 布局已配置 | 打开记录详情 | 字段顺序与布局一致，Picklist/Lookup 显示 label |
| APP-CRUD-04 | 删除记录 | - | 列表删除记录 | 记录被移除，刷新后仍不存在 |
| APP-LOOKUP-01 | Lookup Dialog 交互 | 存在 Lookup 字段 | 编辑页点击 Lookup 字段 → 选择 → 清除 | Dialog 列出候选，选择后显示 label，可清除恢复为空 |

> 可根据以上步骤编写 Playwright/Cypress 自动化脚本（无需登录流程），或手动执行以完成端到端验证。
