# Data Model: Runtime App Backend Pagination

## API Data Structures

### PaginatedResponse
A generic wrapper for lists of records to support pagination.

| Field | Type | Description |
|-------|------|-------------|
| `items` | `List[T]` | List of record objects for the current page. |
| `total` | `Integer` | Total number of records matching the query (ignoring pagination). |

**Example JSON**:
```json
{
  "items": [
    { "uid": "...", "name": "Record 1", ... },
    { "uid": "...", "name": "Record 2", ... }
  ],
  "total": 105
}
```

## Database Changes
No schema changes. Existing `data_{object_name}` tables are used.
