# Data Model: Datetime Field & System Timestamp

## 1. Metadata Schema (`MetaField`)

No structural change to `meta_fields` table, but `data_type` value extension.

| Field | Type | Description |
|-------|------|-------------|
| `data_type` | String | Extended to support value `"Datetime"`. |

## 2. System Objects (`User`, `Account`)

New standard fields added to these system objects.

| Object | Field Name | Data Type | Storage (SQLite) | Properties |
|--------|------------|-----------|------------------|------------|
| `User` | `created_at` | `Datetime` | `TEXT` (ISO8601) | System, Read-Only (API) |
| `User` | `updated_at` | `Datetime` | `TEXT` (ISO8601) | System, Read-Only (API) |
| `Account`| `created_at` | `Datetime` | `TEXT` (ISO8601) | System, Read-Only (API) |
| `Account`| `updated_at` | `Datetime` | `TEXT` (ISO8601) | System, Read-Only (API) |

## 3. Storage Mapping (SQLite)

`SchemaService` mapping update:

| Metadata Type | SQLite Type | Example Value |
|---------------|-------------|---------------|
| `Datetime` | `TEXT` | `"2026-01-11T12:00:00Z"` |

## 4. API Schemas

### Dynamic Record Create/Update

- **Request (Create)**: `created_at` and `updated_at` fields are **ignored**.
- **Request (Update)**: `created_at` and `updated_at` fields are **forbidden** or **ignored**.
- **Response**: Includes `created_at` and `updated_at` as ISO8601 strings.