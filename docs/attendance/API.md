# ZKTeco K40 Attendance System — API Documentation

## Base URL

```
https://your-domain.com/api/attendance
```

---

## 1. Webhook Endpoint (Device → Server)

**ZKTeco K40 ADMS Push SDK sends attendance events here.**

### `POST /api/attendance/device`

**No authentication required** (verified via webhook_secret).

#### Request

Supports single object or array (batch up to 50):

```json
// Single
{
  "device_serial": "K40SN12345",
  "device_user_id": "101",
  "punch_time": "2026-07-09T08:30:00Z",
  "punch_type": "in",
  "packet_id": "txn-abc-123"
}

// Batch (array of above)
[{ ... }, { ... }]
```

| Field | Aliases | Type | Required |
|-------|---------|------|----------|
| `device_serial` | `DeviceSerial`, `serial`, `SN` | string | yes |
| `device_user_id` | `DeviceUserId`, `UserId`, `PIN` | string | yes |
| `punch_time` | `PunchTime`, `Time`, `RecordTime` | ISO 8601 | no (defaults to now) |
| `punch_type` | `PunchType`, `VerifyMode` | `"in"`, `"out"` | no (auto-detected: before 12PM = in) |
| `packet_id` | `PacketID`, `TransactionID`, `uid` | string | no (for dedup) |

#### Response

```json
{
  "ok": true,
  "processed": 1,
  "successful": 1,
  "results": [
    {
      "device_user_id": "101",
      "ok": true,
      "data": {
        "log_id": 42,
        "record_id": 17,
        "user_type": "student",
        "user_id": 5
      }
    }
  ]
}
```

**Duplicate detection:** Returns `"warning": "duplicate_packet"` or `"duplicate_within_window"` (1-min window). Does NOT count as error.

#### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Processed (some may be duplicates) |
| 401 | Unknown device or invalid secret |
| 403 | Device deactivated |
| 413 | Batch exceeds 50 events |
| 429 | Rate limit (20 req/s per IP) |

---

## 2. Management API (Admin UI → Server)

**All endpoints require authentication.** Uses session cookie.

### `GET /api/attendance/manage?action=...`

#### Actions

| Action | Params | Description |
|--------|--------|-------------|
| `stats` | `branch_id` | Today's attendance stats (present/late counts) |
| `live` | `branch_id`, `limit` | Latest attendance events (live feed) |
| `report` | `branch_id`, `start_date`, `end_date`, `user_type`, `status` | Attendance report (add `&format=csv` for CSV download) |
| `devices` | — | List all registered devices |
| `device_mappings` | `device_serial` (optional) | List user-device mappings |
| `device_sync_logs` | `device_serial`, `limit` | Sync audit logs for a device |
| `unmapped_students` | `branch_id`, `device_serial` | Students not yet mapped to a device |

#### Example

```bash
curl "https://your-domain.com/api/attendance/manage?action=stats&branch_id=1" \
  --cookie "admin_session_token=..."
```

### `POST /api/attendance/manage`

| Action | Body Fields | Description |
|--------|-------------|-------------|
| `register_device` | `device_serial`, `device_name`, `branch_id`, `ip_address`, `port`, `model`, `webhook_secret` | Register a new device |
| `update_device` | `id`, `device_name`, `ip_address`, `is_active`, ... | Update device fields |
| `delete_device` | `id` | Remove device and all mappings (CASCADE) |
| `create_mapping` | `device_serial`, `device_user_id`, `user_type`, `user_id`, `full_name` | Link a device PIN to a user |
| `delete_mapping` | `id` | Remove mapping |
| `manual_correction` | `id`, `user_type`, `user_id`, `attendance_date`, `status` | Override attendance status |
| `heartbeat` | `device_serial`, `status`, `ip_address` | Device health check |
| `mark_offline` | — | Mark stale devices as offline |
| `cleanup` | `retention_days` (default 90) | Delete old data (admin only) |

#### Example

```bash
curl -X POST "https://your-domain.com/api/attendance/manage" \
  --cookie "admin_session_token=..." \
  -H "Content-Type: application/json" \
  -d '{"action":"register_device","data":{"device_serial":"K40XYZ","device_name":"Main Gate","branch_id":1}}'
```

---

## 3. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key for Realtime |
| `SUPABASE_URL` | yes | Same as above (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service role key (bypasses RLS) |

---

## 4. Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `attendance_devices` | Registered ZKTeco K40 devices |
| `device_user_mappings` | Maps device PIN → system user |
| `attendance_logs` | Raw punch events from devices |
| `attendance_records` | Processed daily attendance |
| `attendance_sync_logs` | Audit trail (batched writes) |
| `attendance_device_heartbeats` | Device health checks |

### Key Indexes

- `idx_devices_serial_active` — covering index for webhook lookup
- `idx_mappings_lookup` — covering index for PIN → user resolution
- `idx_records_dashboard_stats` — composite for quick stats
- `idx_records_report` — composite for date-range reports
- `idx_logs_dedup` — dedup by device + user + time window

---

## 5. Webhook URL

After deployment, configure your ZKTeco K40 ADMS with:

```
https://your-domain.com/api/attendance/device
```

Replace `your-domain.com` with your actual Vercel/Railway domain.
