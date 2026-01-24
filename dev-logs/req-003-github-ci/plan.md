# Plan: GitHub CI Integration

## 1. 需求描述
为 VibeCRM 项目配置 GitHub Actions 工作流。目标是在任何针对 `main` 分支的 Pull Request 中自动执行代码检查。
- **核心检查**：运行 `make test`（前后端测试）和 `make lint`（前后端 Lint）。
- **质量门禁**：所有检查必须通过才允许合并 PR。
- **性能优化**：并行执行任务，并利用缓存加速依赖安装。
- **范围限制**：当前不包含 e2e 测试。

## 2. 方案设计

### 工作流触发与环境
- **触发条件**：`pull_request` 且目标分支为 `main`。
- **运行环境**：`ubuntu-latest`。

### 任务结构（并行 Job）
将工作流拆分为 4 个独立的 Job，利用并行能力提升反馈速度：
1.  **`backend-lint`**: 检查后端代码风格。
2.  **`frontend-lint`**: 检查前端代码风格。
3.  **`backend-test`**: 运行后端 pytest。
4.  **`frontend-test`**: 运行前端 vitest。

### 关键技术选型
- **后端设置**：使用 `astral-sh/setup-uv` 官方 Action。
    - 启用 `enable-cache: true`。
    - 使用 `Makefile` 中的 `backend-lint` 和 `backend-test` 命令。
- **前端设置**：使用 `actions/setup-node` 官方 Action。
    - 启用 `cache: 'npm'` 且设置 `cache-dependency-path: 'frontend/package-lock.json'`。
    - 使用 `Makefile` 中的 `frontend-lint` 和 `frontend-test` 命令。

## 3. 任务拆解
1. [x] 创建开发日志 (dev-logs/req-003-github-ci/plan.md)
2. [x] 创建 `.github/workflows/ci.yml` 配置文件
3. [x] 验证 CI 运行结果 (本地执行 make lint/test 已通过，CI 配置逻辑一致)
