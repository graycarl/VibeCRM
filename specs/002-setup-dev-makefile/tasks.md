# Tasks: 添加开发环境 Makefile

**Branch**: `002-setup-dev-makefile` | **Spec**: [Link](spec.md) | **Plan**: [Link](plan.md)

## Implementation Steps

### Phase 1: Setup & Infrastructure
**Goal**: Initialize the Makefile structure.

- [x] T001 Create Makefile in project root with PHONY targets definition `Makefile`

### Phase 2: Foundational Tasks
**Goal**: Define shared variables and basic structure.

- [x] T002 Define shell and project root variables in Makefile `Makefile`

### Phase 3: User Story 1 - 环境初始化 (Priority: P1)
**Goal**: Enable one-command environment setup.
**Test**: Run `make init` in a clean env (no .venv/node_modules) and verify dependencies install.

- [x] T003 [P] [US1] Define `backend-init` target using `uv sync` in `Makefile`
- [x] T004 [P] [US1] Define `frontend-init` target using `npm ci` in `Makefile`
- [x] T005 [US1] Define `init` target combining backend and frontend init in `Makefile`

### Phase 4: User Story 2 - 启动开发服务 (Priority: P1)
**Goal**: Start both services simultaneously.
**Test**: Run `make dev`, check localhost:8000 (API) and localhost:5173 (Frontend).

- [x] T006 [P] [US2] Define `backend-dev` target to run FastAPI app in `Makefile`
- [x] T007 [P] [US2] Define `frontend-dev` target to run Vite dev server in `Makefile`
- [x] T008 [US2] Define `dev` target using `make -j 2` to run both services in `Makefile`

### Phase 5: User Story 3 - 重置数据库 (Priority: P2)
**Goal**: Reset database to clean state.
**Test**: Run `make reset`, verify old data gone and seed data present.

- [x] T009 [US3] Define `clean-db` target to remove SQLite file in `Makefile`
- [x] T010 [US3] Define `seed-db` target to run `init_db.py` and `seeds.py` in `Makefile`
- [x] T011 [US3] Define `reset` target combining clean and seed tasks in `Makefile`

### Phase 6: User Story 4 - 运行测试 (Priority: P2)
**Goal**: Run all tests with fail-fast strategy.
**Test**: Run `make test`, ensure backend failure stops execution.

- [x] T012 [P] [US4] Define `backend-test` target using `pytest` in `Makefile`
- [x] T013 [P] [US4] Define `frontend-test` target using `npm run test` in `Makefile`
- [x] T014 [US4] Define `test` target executing backend then frontend tests in `Makefile`

### Final Phase: Polish
**Goal**: Cleanup and documentation.

- [x] T015 Add comments and help descriptions for all targets in `Makefile`

## Dependencies

1. **T001 -> T002**: Basic file setup required before variables.
2. **T003/T004 -> T005**: Component inits required for main init.
3. **T006/T007 -> T008**: Component dev targets required for main dev.
4. **T009/T010 -> T011**: DB steps required for reset.
5. **T012/T013 -> T014**: Test steps required for main test.
6. **All -> T015**: Final polish.

## Implementation Strategy

- **MVP Scope**: Complete US1 and US2 (Init and Dev) to enable basic workflow.
- **Parallel Execution**: Backend and Frontend tasks within each story can be defined independently in the Makefile, but the Makefile itself is a single file so parallel editing is limited. However, the logic for backend vs frontend targets is distinct.
