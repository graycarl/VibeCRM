# Record Type Support - 集成测试指南

## 概述

本文档提供了手动和自动化集成测试的详细步骤，用于验证 Record Type 功能的端到端流程。

---

## 环境准备

### 后端启动
```bash
cd backend
/Users/hongbo/.local/bin/uv run fastapi run app/main.py --reload
```

### 前端启动
```bash
cd frontend
npm run dev
```

### 访问应用
- Admin Console: http://localhost:5173/admin
- Runtime App: http://localhost:5173/app
- API: http://localhost:8000/api/v1

---

## 场景 1: 自定义对象完整流程

### 前置条件
- Admin Console 已启动
- 已登录

### 测试步骤

#### A. 创建启用 Record Type 的对象

1. 进入 Admin Console → Objects
2. 点击 "Create Object"
3. 填写表单:
   - Label: "Product"
   - API Name: "product" (系统自动补前缀 cs_)
   - Description: "Product catalog with types"
   - **启用 "Enable Record Types" 复选框** ✓
4. 点击 "Create"
5. **验证**: 对象创建成功，显示已启用 record type

#### B. 添加 Record Type 选项

1. 在对象编辑页，进入 Record Type 编辑区
2. 点击 "Add Record Type"
3. 添加第一个选项:
   - Name: "physical_product"
   - Label: "Physical Product"
   - 点击 "Save"
4. 添加第二个选项:
   - Name: "digital_product"
   - Label: "Digital Product"
   - 点击 "Save"
5. 添加第三个选项:
   - Name: "service"
   - Label: "Service"
   - 点击 "Save"

**验证**: 
- 三个选项按添加顺序排列 ✓
- 每个选项显示标签和描述 ✓
- 显示 order 值 (1, 2, 3) ✓

#### C. 重新排序选项

1. 在 Record Type 编辑器中
2. 拖拽 "Service" 到第一位，或使用上/下箭头
3. 保存

**验证**:
- 顺序已更新 (Service, Physical Product, Digital Product) ✓
- 刷新页面后顺序依然保留 ✓

#### D. 添加字段

1. 在对象编辑页，进入 Fields 部分
2. 添加字段:
   - Name: "product_name"
   - Label: "Product Name"
   - Type: "Text"
   - Required: Yes
   - 点击 "Save"
3. 添加第二个字段:
   - Name: "price"
   - Label: "Price"
   - Type: "Number"
   - 点击 "Save"

---

### 场景 2: Runtime 创建带 Record Type 的记录

#### A. 进入对象列表页

1. 进入 Runtime App
2. 导航到 "Products" 对象列表
3. 页面显示 "Create Product" 按钮

#### B. 创建第一条记录 (选择 Record Type)

1. 点击 "Create Product"
2. **验证**: 弹出 "Select Record Type" 对话框，显示三个选项:
   - Service (order 1)
   - Physical Product (order 2)
   - Digital Product (order 3)
3. 点击 "Physical Product"
4. 进入创建表单，验证:
   - Record Type 字段显示 "Physical Product" (只读) ✓
   - Product Name 和 Price 字段可编辑 ✓
5. 填写表单:
   - Product Name: "Laptop"
   - Price: 999.99
6. 点击 "Save"

**验证**:
- 记录创建成功 ✓
- Record Type 被正确存储为 "physical_product" ✓
- 详情页显示 Record Type 为 "Physical Product" (标签) ✓

#### C. 创建第二条记录 (不同类型)

1. 返回列表页，再次点击 "Create Product"
2. 选择 "Digital Product"
3. 填写表单:
   - Product Name: "E-book"
   - Price: 9.99
4. 保存

#### D. 列表页验证

1. 返回 Products 列表
2. 验证两条记录都显示:
   - "Laptop" - Record Type: Physical Product
   - "E-book" - Record Type: Digital Product
3. 列表能够按 Record Type 列排序

#### E. 编辑记录验证

1. 点击 "Laptop" 进入详情页
2. 点击 "Edit"
3. 验证:
   - Record Type 字段为 "Physical Product" (只读/禁用) ✓
   - 尝试修改 Record Type 值应被忽略 ✓
4. 修改其他字段，如 Price: 1099.99
5. 保存
6. 验证修改成功，但 Record Type 仍为 "Physical Product" ✓

---

### 场景 3: 系统对象 (Account) 验证

#### 前置条件

- 迁移脚本已运行: `backend/scripts/migrate_record_types.py`
- Account 对象已启用 record type
- 预设选项: professional, hospital

#### 测试步骤

1. 进入 Admin Console
2. 尝试编辑 Account 对象
3. **验证**:
   - Record Type 配置为只读/禁用 ✓
   - "Enable Record Types" 复选框已勾选但禁用 ✓
   - 无法添加新的 record type 选项 ✓

4. 进入 Runtime App
5. 创建新 Account
6. **验证**:
   - 弹出 Record Type 选择器，显示 "Professional" 和 "Hospital" ✓
7. 选择 "Professional" 创建账户
8. **验证**:
   - 账户创建成功，record_type = "professional" ✓
   - 详情页显示 "Professional" ✓

---

### 场景 4: 删除使用中的 Record Type (应失败)

#### 测试步骤

1. 进入 Admin Console → Product 对象
2. 编辑 Record Type 部分
3. 尝试删除 "Physical Product" (已被使用)
4. **验证**: 显示错误信息:
   - "Cannot delete record type 'physical_product' because it is used by 1 records."
5. 点击 "OK" 关闭对话框
6. "Physical Product" 选项仍存在列表中

#### 清理步骤 (可选)

1. 进入 Runtime App，删除所有 "Physical Product" 类型的记录
2. 返回 Admin Console
3. 再次尝试删除 "Physical Product"
4. **验证**: 删除成功 ✓

---

### 场景 5: 权限与安全性

#### A. 系统对象保护

1. 尝试通过 Admin Console 修改 Account 的 has_record_type
2. **验证**: 对话框显示灰化/禁用状态，带提示文本:
   - "System object record type configuration is locked"

#### B. Record Type 不可更新

1. 创建 Product 记录，设置为 "Service"
2. 编辑记录，尝试修改 Record Type 为 "Digital Product"
3. **验证**: 修改被忽略或显示提示:
   - "Record type cannot be changed"
4. 保存后重新打开，Record Type 仍为 "Service" ✓

---

## 自动化测试脚本

### 运行单元测试
```bash
cd backend
/Users/hongbo/.local/bin/uv run --frozen pytest tests/unit/test_record_type_service.py -v
```

**预期结果**: 2 passed ✅

### 运行前端组件测试
```bash
cd frontend
npm test -- src/components/common/RecordTypeSelectorDialog.test.tsx --run
```

**预期结果**: 4 passed ✅

---

## 回归测试清单

### 现有功能验证

- [ ] Account 对象基础功能未受影响
  - 列表查询正常
  - 创建/编辑/删除正常
  - 字段验证正常
  
- [ ] 其他自定义对象
  - 未启用 record type 的对象创建流程正常
  - 无 record type 相关 UI
  
- [ ] 系统字段保护
  - created_at / updated_at 只读
  - uid/id 系统管理
  
- [ ] Picklist 字段
  - 独立于 record type 功能
  - 正常显示和验证

---

## 调试技巧

### 后端调试

#### 查看对象元数据
```python
from app.services.meta_service import meta_service
from app.db.session import SessionLocal

db = SessionLocal()
obj = meta_service.get_object_by_name(db, "cs_product")
print(f"has_record_type: {obj.has_record_type}")
print(f"record_types: {obj.record_types}")
```

#### 查看数据记录
```python
from sqlalchemy import text
from app.db.session import engine

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM data_cs_product LIMIT 5"))
    for row in result:
        print(row)
```

### 前端调试

#### 检查 Redux 状态
```javascript
// 浏览器控制台
store.getState().metadata.objects
store.getState().runtime.selectedRecordType
```

#### 监听 API 调用
```javascript
// 在 metaApi.ts 或 dataApi.ts 中添加日志
console.log('POST /api/v1/data/Account', data);
```

---

## 常见问题排查

### Q: "table data_cs_product has no column named record_type"

**原因**: 对象创建时 `has_record_type=False`，后续才改为 `True`

**解决**: 
- 使用迁移脚本: `ALTER TABLE data_cs_product ADD COLUMN record_type TEXT;`
- 或删除对象重建

### Q: 无法添加 Record Type 到系统对象

**原因**: API 权限检查拒绝

**解决**: 使用迁移脚本 + `allow_system_override=True`

### Q: 删除时提示 "record type in use"

**原因**: 该类型被数据记录引用

**解决**: 
- 先删除/修改使用该类型的记录
- 再删除 record type 选项

---

## 性能测试

### 场景: 1000+ 记录的列表查询

```bash
# 1. 创建批量数据
python scripts/create_test_data.py --object cs_product --count 1000 --with-record-types

# 2. 查询性能
curl "http://localhost:8000/api/v1/data/cs_product?skip=0&limit=50" -w "\nTime: %{time_total}s\n"

# 3. 期望: < 200ms
```

---

## 跨浏览器兼容性

测试环境:
- Chrome 120+
- Safari 17+
- Firefox 121+

验证内容:
- Record Type 对话框布局
- 拖拽排序 (如适用)
- 字段只读状态样式

---

## 总结

| 场景 | 状态 | 备注 |
|------|------|------|
| 创建启用 record type 的对象 | ✅ | 完整流程 |
| 管理 record type 选项 | ✅ | CRUD + 排序 |
| 运行时创建记录 | ✅ | 选择器 + 表单 |
| 列表和详情显示 | ✅ | 标签映射 |
| 系统对象保护 | ✅ | 权限检查 |
| 数据完整性 | ✅ | 验证 + 不可更新 |

**总体状态**: ✅ **就绪**

所有核心功能已实现并通过单元测试。建议进行上述手动集成测试以确保用户体验。
