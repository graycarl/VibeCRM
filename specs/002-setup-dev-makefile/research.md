# Research: Development Makefile

**Decision**: Use GNU Make for task automation.
**Rationale**: 
- Standard tool available on macOS/Linux.
- Native support for parallel execution (`-j`).
- Simple syntax for wrapping shell commands.
- No extra dependencies required for the task runner itself.

**Decision**: Use `npm ci` for frontend initialization.
**Rationale**: Ensures a clean, reproducible state based on `package-lock.json`, which is critical for CI and "reset" scenarios.

**Decision**: Use `uv sync` for backend initialization.
**Rationale**: `uv` is the project's chosen Python package manager and `sync` ensures the virtual environment matches the lock file exactly.

**Decision**: Use `make -j 2` for `make dev`.
**Rationale**: Simpler than introducing `concurrently` (node package) or `foreman`. Allows unified control (Ctrl-C kills both) without extra dependencies.

**Alternatives Considered**:
- **Just / Task**: More modern, but require installation. Make is pre-installed.
- **npm scripts**: Good for frontend, but awkward for Python backend tasks and root-level orchestration.
- **Shell scripts**: Harder to manage dependencies between tasks (e.g., `init` before `dev`).
