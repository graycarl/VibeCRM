# Quickstart: Datetime Field Feature

## 1. Prerequisites
- Backend running: `make run-backend`
- Frontend running: `make run-frontend`
- Database initialized with latest seeds.

## 2. Validation Steps

### Verify System Objects
1. Open Admin Console.
2. Navigate to **Objects > User** (or Account).
3. Verify `created_at` and `updated_at` fields exist in the field list.

### Verify Creation Logic
1. Go to **User App** (Runtime).
2. Create a new **User** or **Account**.
3. **Check**: The form should NOT allow editing `created_at` or `updated_at`.
4. Save the record.
5. Open the Record Detail page.
6. **Verify**: "Created At" and "Updated At" fields display the current time.

### Verify Update Logic
1. Edit the record created above.
2. Change a normal field (e.g., Name) and Save.
3. Open Detail page.
4. **Verify**: `updated_at` has changed to a later time, while `created_at` remains the same.

### Verify Datetime Field (Custom)
1. Go to Admin Console > Objects > Create New Object (e.g., "Event").
2. Add a field "Start Time" with type **Datetime**.
3. Go to Runtime App > Event > New.
4. **Verify**: You see a datetime picker.
5. Select a time and save.
6. **Verify**: Detail page shows the correct time.

## 3. Troubleshooting
- **Timezone off?**: Check if your computer's timezone matches what you expect. The DB stores UTC.
- **Field not showing?**: Ensure you re-seeded the database: `rm vibe.db && make init-db`.