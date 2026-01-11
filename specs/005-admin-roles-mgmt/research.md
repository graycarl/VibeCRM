# Research: Admin Roles Management

**Feature**: Admin Roles Management (005)
**Status**: Complete

## 1. Technical Decisions

### Backend Architecture
- **Decision**: Extend existing Metadata service and API structure.
- **Rationale**: `MetaRole` is already defined in `backend/app/models/metadata.py` alongside `MetaObject`. Keeping related metadata operations in `meta_service.py` and `api/endpoints/meta.py` maintains cohesion.
- **Alternatives Considered**: Creating a separate `role_service.py` and `api/endpoints/roles.py`. Rejected because `MetaRole` is a core metadata component similar to `MetaObject`, and the current volume of code doesn't warrant splitting yet.

### Frontend Navigation
- **Decision**: Use Material UI `List`, `ListItemButton`, and `Collapse` components to create a hierarchical "Setup" menu.
- **Rationale**: Standard pattern for nested navigation in MUI applications. Matches the "Setup" paradigm found in Salesforce and other CRMs.

### Frontend State Management
- **Decision**: Use local state (`useState`, `useEffect`) for the Role List and Dialogs, consistent with `ObjectList.tsx`.
- **Rationale**: The application currently uses simple local state management. Introducing Redux or Context for this isolated feature is unnecessary complexity.

### Permissions Editing
- **Decision**: Use a simple text area with JSON validation for the `permissions` field.
- **Rationale**: As per the spec, a complex UI is out of scope. A text area allows full flexibility for defining permission structures until a dedicated UI is designed.

## 2. Implementation details

### Backend
- **Schemas (`backend/app/schemas/metadata.py`)**:
  - `MetaRoleBase`: name, label, description, permissions (optional dict).
  - `MetaRoleCreate`: Inherits Base.
  - `MetaRoleUpdate`: Inherits Base, all optional.
  - `MetaRole`: Inherits Base, adds id, created_at, source.
- **Service (`backend/app/services/meta_service.py`)**:
  - `create_role(db, role_in)`: Check uniqueness, create `MetaRole`.
  - `get_roles(db, skip, limit)`: List roles.
  - `get_role(db, role_id)`: Get single role.
  - `update_role(db, role_id, role_in)`: Update fields.
  - `delete_role(db, role_id)`: Check source != 'system', delete.
- **API (`backend/app/api/endpoints/meta.py`)**:
  - `GET /roles`
  - `POST /roles`
  - `GET /roles/{id}`
  - `PUT /roles/{id}`
  - `DELETE /roles/{id}`

### Frontend
- **API Client (`frontend/src/services/metaApi.ts`)**:
  - Add `MetaRole` interface.
  - Add `getRoles`, `createRole`, `updateRole`, `deleteRole` methods.
- **Components**:
  - `frontend/src/pages/admin/RoleList.tsx`: DataGrid showing roles.
  - `frontend/src/components/admin/RoleCreateDialog.tsx`: Dialog with form fields.
  - `frontend/src/components/admin/RoleEditDialog.tsx`: Similar to create, but with pre-filled data (or combine into one component).
- **Layout (`frontend/src/layouts/MainLayout.tsx`)**:
  - Introduce `ExpandLess`/`ExpandMore` icons.
  - Wrap "Objects" and "Roles" in a `Collapse` component triggered by a "Setup" parent item.
