# Requirement Analysis & Implementation Plan: Seed Owner Support

## 1. 需求描述
为所有 Seed 数据补充 `owner` 字段支持。通过在 YAML 记录文件中显式指定负责人（使用用户姓名），使系统在导入种子数据时能够正确填充数据库记录的 `owner_id` 字段。

## 2. 方案设计

### 2.1 种子文件重命名
将 `db/seed/record-user.yml` 重命名为 `db/seed/record-00-user.yml`。
- **目的**：确保在加载其他业务对象（Account, Call 等）之前，用户数据已存在，从而能够成功解析 `owner` 关联。

### 2.2 Seed 引擎升级 (`backend/app/db/seeds.py`)
修改 `process_records` 函数，增加对 `owner` 字段的处理逻辑：
1. 检查输入数据中是否存在 `owner` 键。
2. 如果存在，调用 `resolve_lookup` 函数，目标对象固定为 `user`，查找对应的用户 ID。
3. 将解析出的用户 ID 作为 `user_id` 参数传递给 `data_service.create_record`。
4. 从原始 `data` 字典中移除 `owner` 键，避免干扰后续的字段校验。

### 2.3 种子数据更新
更新以下文件中的记录，增加 `owner` 字段：
- `db/seed/record-01-account.yml`
- `db/seed/record-02-product.yml`
- `db/seed/record-03-call.yml`
- `db/seed/record-04-expense.yml`

## 3. 任务拆解

- [ ] **Task 1: 重命名用户种子文件**
    - 将 `db/seed/record-user.yml` 移动至 `db/seed/record-00-user.yml`。
- [ ] **Task 2: 修改 Seed 导入引擎**
    - 在 `backend/app/db/seeds.py` 中实现 `owner` 字段的解析和传递。
- [ ] **Task 3: 补充业务数据 Owner**
    - 遍历所有 `record-*.yml` 文件（除用户文件外），为记录添加 `owner: 管理员`。
- [ ] **Task 4: 验证**
    - 执行 `make reset`。
    - 检查数据库中 `data_account`, `data_call` 等表的 `owner_id` 字段是否已正确填充。
