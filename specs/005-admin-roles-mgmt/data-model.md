# Data Model: Admin Roles Management

## Entities

### MetaRole
Represents a user role within the system, defining a set of permissions.

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| id | UUID | Yes | Primary Key | |
| name | String | Yes | Unique identifier (API name) | Unique, Lowercase, No spaces |
| label | String | Yes | Display name | |
| description | Text | No | Description of the role | |
| permissions | JSON | No | Structured permission definitions | |
| source | String | Yes | Origin of the role | 'system' or 'custom' |
| created_at | DateTime | Yes | Creation timestamp | |

## API Contracts

### GET /api/v1/meta/roles
List all roles.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "admin",
    "label": "Administrator",
    "description": "System admin",
    "permissions": {},
    "source": "system",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/v1/meta/roles
Create a new role.

**Request:**
```json
{
  "name": "sales_manager",
  "label": "Sales Manager",
  "description": "Manages sales team",
  "permissions": {}
}
```

**Response:** `200 OK` with created Role object.

### GET /api/v1/meta/roles/{id}
Get details of a specific role.

### PUT /api/v1/meta/roles/{id}
Update a role.

**Request:**
```json
{
  "label": "Sales Director",
  "description": "Updated description",
  "permissions": {"object:view": "all"}
}
```

### DELETE /api/v1/meta/roles/{id}
Delete a role.
**Constraint**: Cannot delete if `source` is "system".
