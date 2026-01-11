# Quickstart: Picklist Field Verification

本文档描述如何通过开发者流程验证 Picklist 功能。

## 1. 初始化环境
```bash
make setup-db
```
这将加载 seed 数据，包含 `Account.sex` 字段。

## 2. 验证 Admin Console
1. 进入“设置” -> “对象管理” -> “Account” -> “字段”。
2. 编辑 `sex` 字段，应能看到“男”和“女”选项。
3. 添加一个新选项 `other: 其他`，确认实时保存成功。

## 3. 验证 Runtime App
1. 进入 Account 列表页，点击“新建”。
2. 找到“性别”字段，确认显示为下拉框。
3. 在下拉框中输入“男”，应能过滤出对应选项。
4. 选择并保存，在详情页应显示“男”而非 `male`。

## 4. 验证后端校验
使用 curl 发送非法请求：
```bash
curl -X POST http://localhost:8000/api/data/account \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Account", "sex": "invalid_value"}'
```
**预期结果**: 返回 `400 Bad Request`，提示选项无效。
