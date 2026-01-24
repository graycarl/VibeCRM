# 需求分析与设计方案：添加 `make lint` 代码检查

## 1. 需求描述
为 VibeCRM 项目建立统一的代码质量检查机制。通过在根目录执行 `make lint`，同时对后端（Python）和前端（TypeScript/React）代码进行静态扫描。
- **行为**：仅执行检查（Read-only），不自动修改代码。若发现不合规项，命令应以非零状态退出，以便未来集成 CI。
- **范畴**：侧重于代码风格和语法逻辑（Lint），不包含类型检查（Type Check）。
- **标准**：采用社区主流的默认推荐配置，保持配置简洁。

## 2. 方案设计

### 2.1 后端 (Backend)
- **工具选择**：使用 `ruff`。它集成了 Flake8, Isort, Black 等多种工具的功能，且性能极快。
- **配置策略**：
    - 在 `backend/pyproject.toml` 中已有的 `[tool.ruff]` 基础上，保持现状。
    - 将 `ruff` 添加到 `dependency-groups.dev` 中。
- **集成命令**：`uv run ruff check .`

### 2.2 前端 (Frontend)
- **工具选择**：使用 `eslint`。
- **配置策略**：
    - 补全缺失的依赖：`eslint` 及 React/TypeScript 相关插件。
    - 新建 `frontend/.eslintrc.cjs`，采用 `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react-hooks/recommended` 等标准规则集。
- **集成命令**：`npm run lint`（对应 `package.json` 中已有的脚本，但需确保环境跑通）。

### 2.3 顶层 Makefile
- 新增 `lint`, `backend-lint`, `frontend-lint` 三个 target。
- `make lint` 汇总执行前后端的检查。

## 3. 任务拆解

### 第一阶段：后端环境完善
1.  进入 `backend` 目录，使用 `uv add --dev ruff` 安装依赖。
2.  在 `backend/` 目录下手动运行 `uv run ruff check .` 验证工具是否能正常工作。

### 第二阶段：前端环境完善
1.  进入 `frontend` 目录，安装 Lint 相关开发依赖：
    - `eslint`
    - `eslint-plugin-react-hooks`
    - `eslint-plugin-react-refresh`
    - `@typescript-eslint/parser`
    - `@typescript-eslint/eslint-plugin`
2.  创建 `frontend/.eslintrc.cjs` 配置文件。
3.  在 `frontend/` 目录下运行 `npm run lint` 验证。

### 第三阶段：Makefile 集成
1.  修改根目录 `Makefile`：
    - 在 `HELP` 部分增加 `lint` 说明。
    - 定义 `lint: backend-lint frontend-lint`。
    - 定义 `backend-lint`: 执行 `cd backend && uv run ruff check .`。
    - 定义 `frontend-lint`: 执行 `cd frontend && npm run lint`。

### 第四阶段：最终验证
1.  在根目录执行 `make lint`。
2.  确认输出结果清晰，且在有错误时能正确报错。
