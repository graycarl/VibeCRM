<!--
  LANGUAGE REMINDER: As per the constitution (Principle V), the content of this
  specification document MUST be written in Chinese.
-->
# Feature Specification: 添加开发环境 Makefile

**Feature Branch**: `002-setup-dev-makefile`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "添加一个 Makefile 用于本地开发时可以快速初始化环境 make init，快速同时启动前后端服务 make dev，快速重置数据库 make reset，快速运行测试 make test。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 环境初始化 (Priority: P1)

新加入项目的开发者或者在清理环境后，需要能够一键安装所有后端和前端的依赖，准备好开发环境。

**Why this priority**: 这是开发的第一步，降低了环境搭建的门槛和出错率。

**Independent Test**: 在一个没有 `node_modules` 和 `.venv` 的干净环境下运行命令，检查依赖是否安装成功。

**Acceptance Scenarios**:

1. **Given** 一个刚 clone 下来的项目代码库，且系统已安装基本的 Python 和 Node.js 环境，**When** 运行 `make init`，**Then** 后端依赖 (`uv sync`) 和前端依赖 (`npm install`) 均成功安装。

---

### User Story 2 - 启动开发服务 (Priority: P1)

开发者日常开发时，需要能够通过一个简单的命令同时启动后端 API 服务和前端开发服务器，以便进行联调和预览。

**Why this priority**: 这是最高频的操作，简化启动流程可以显著提升开发效率。

**Independent Test**: 运行命令后，浏览器能否访问前端页面，且前端能否成功调用后端 API。

**Acceptance Scenarios**:

1. **Given** 依赖已安装，**When** 运行 `make dev`，**Then** 后端 FastAPI 服务和前端 Vite 服务同时启动，控制台输出包含两者的日志。

---

### User Story 3 - 重置数据库 (Priority: P2)

在开发过程中，开发者可能破坏了本地数据，或者需要一个干净的数据库状态来验证功能，需要能够一键重置数据库并填充初始数据。

**Why this priority**: 保证开发环境数据的可控性，方便重复测试。

**Independent Test**: 修改或删除数据库文件后运行命令，检查数据库是否恢复到初始种子状态。

**Acceptance Scenarios**:

1. **Given** 存在的 SQLite 数据库文件，**When** 运行 `make reset`，**Then** 旧数据被清除，数据库表结构被重新创建，并填充了预设的种子数据。

---

### User Story 4 - 运行测试 (Priority: P2)

开发者在提交代码前，需要能够快速运行所有测试用例（后端和前端），以确保代码没有破坏现有功能。

**Why this priority**: 保证代码质量，防止回归。

**Independent Test**: 运行命令，检查是否执行了预期的测试套件并报告结果。

**Acceptance Scenarios**:

1. **Given** 代码库中包含测试用例，**When** 运行 `make test`，**Then** 后端的 `pytest` 和前端的测试脚本依次或并行执行，并输出测试报告。

### Edge Cases

- 当端口被占用时，`make dev` 应该如何表现？（通常由底层工具报错，Makefile 需透传错误）。
- 当 `make init` 中途失败（如网络原因），再次运行是否安全？（应该是幂等的）。

## Clarifications

### Session 2026-01-07

- Q: How to run services in parallel for 'make dev'? → A: Use standard `make -j` (no extra dependencies, interleaved logs).
- Q: 'make test' behavior on failure? → A: Fail fast (stop immediately if first suite fails).
- Q: Preferred command for frontend init? → A: npm ci (clean install).
- Q: How to handle port configuration? → A: Standard behavior (rely on .env or defaults, no Makefile overrides).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `make init` 必须执行后端依赖安装（使用 `uv sync`）和前端依赖安装（使用 `npm ci` 以确保环境一致性）。
- **FR-002**: `make dev` 必须利用 Make 的并行执行能力（`make -j`）同时启动后端服务（指向 `backend/app/main.py`）和前端服务（`npm run dev`）。服务应通过各自的配置文件（如 `.env`）或默认值管理端口，Makefile 不提供端口覆盖参数。
- **FR-003**: `make reset` 必须能够处理 SQLite 数据库文件的删除或清空，并调用后端脚本重新初始化数据库（`init_db.py` 和 `seeds.py`）。
- **FR-004**: `make test` 必须顺序执行后端测试（`pytest`）和前端测试（`npm run test`），并采用 Fail Fast 策略（若前者失败则立即停止）。
- **FR-005**: 所有命令必须在项目根目录下执行。

### Non-Functional Requirements

- **PERF-001**: `make dev` 的启动延迟应仅受限于底层服务启动时间，不应引入显著额外延迟。
- **UX-001**: 命令输出应清晰，尽可能区分前后端的日志输出（如可行）。

### Key Entities *(include if feature involves data)*

N/A - 这是一个构建工具特性，不涉及业务实体建模。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在全新环境下，执行 `make init` 后，`make dev` 能在 1 分钟内成功启动应用（假设网络正常）。
- **SC-002**: `make reset` 命令执行时间不超过 10 秒（取决于种子数据量）。
- **SC-003**: 开发者不再需要记忆复杂的 `uv run ...` 或 `npm ...` 命令组合，所有常用操作均通过 `make` 完成。