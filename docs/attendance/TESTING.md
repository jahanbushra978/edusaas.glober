# ZKTeco K40 Attendance System — Testing & Troubleshooting Guide

## Testing Guide

### 1. Unit Tests (Manual)

#### Test Webhook Endpoint

```bash
# Simulate a device push event
curl -X POST https://your-domain.com/api/attendance/device \
  -H "Content-Type: application/json" \
  -d '{
    "device_serial": "K40TEST001",
    "device_user_id": "101",
    "punch_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "punch_type": "in",
    "packet_id": "test-'$(date +%s)'"
  }'
```

Expected response:
```json
{ "ok": true, "processed": 1, "successful": 1, "results": [...] }
```

#### Test Duplicate Detection

Send the same request again — should return `"is_duplicate": true`.

#### Test Unknown Device

Change `device_serial` to a non-existent one — should return `401`.

#### Test Rate Limit

Send 21 requests in 1 second — the 21st should return `429`.

### 2. Management API Tests

```bash
# Test stats
curl "https://your-domain.com/api/attendance/manage?action=stats&branch_id=1" \
  --cookie "admin_session_token=..."

# Test live feed
curl "https://your-domain.com/api/attendance/manage?action=live&branch_id=1&limit=10" \
  --cookie "admin_session_token=..."
```

### 3. UI Tests

1. **Dashboard tab** → Verify stat cards show correct counts
2. **Live Feed** → Touch a fingerprint on the K40 — event appears within seconds
3. **Devices tab** → Register a device, verify it appears. Delete it, verify it's gone.
4. **Mappings tab** → Create a mapping, verify it appears. Delete it, verify.
5. **Reports tab** → Select date range, click "Generate", verify entries appear.
6. **CSV Export** → Click "CSV", verify file downloads with correct data.
7. **Manual correction** → Change a status, verify it updates.

### 4. Performance Tests

- **Batch events**: Send 50 events in one POST — verify all processed.
- **Concurrent**: Send events for different users simultaneously — verify no data loss.
- **Stats accuracy**: Compare dashboard stats with Supabase query results.

---

## Troubleshooting Guide

### Problem: Device shows "offline" in Devices tab

**Causes & fixes:**

1. **No heartbeat received** — Devices send heartbeats via the `heartbeat` action:
   ```bash
   curl -X POST https://your-domain.com/api/attendance/manage \
     -H "Content-Type: application/json" \
     --cookie "admin_session_token=..." \
     -d '{"action":"heartbeat","data":{"device_serial":"K40XYZ","status":"online"}}'
   ```
   Or touch a fingerprint — the webhook also updates `last_attendance_at`.

2. **ADMS not configured** — Verify the K40's Push Mode is set to ADMS with the correct server URL.

3. **Network issue** — K40 must reach your server. Check firewall, DNS, and port 443.

4. **Force online check** — Click "Refresh" in the UI, or call:
   ```bash
   curl -X POST https://your-domain.com/api/attendance/manage \
     -H "Content-Type: application/json" \
     --cookie "admin_session_token=..." \
     -d '{"action":"mark_offline","data":{}}'
   ```

### Problem: Webhook returns "unknown_device"

**Fix:** Register the device first via the UI (Devices tab → "Register Device").

The `device_serial` in the webhook request must match exactly what you entered during registration.

### Problem: Webhook returns "no_mapping"

**Fix:** Create a mapping in the Mappings tab. Link the device's `device_user_id` (PIN on the K40) to a system user (student/teacher).

### Problem: Webhook returns "invalid_secret"

**Fix:** Either:
- Remove the `webhook_secret` from the device (set to empty string), OR
- Send the correct Bearer token in the `Authorization` header:
  ```
  Authorization: Bearer <webhook_secret>
  ```

### Problem: Live feed not updating in real-time

**Fix:**
1. Ensure Realtime is enabled for `attendance_logs` table in Supabase → Database → Replication
2. Check browser console for channel subscription errors
3. The feed auto-polls every 10 seconds as fallback

### Problem: Stats show 0 for everything

**Fix:**
1. Ensure `branch_id` is set correctly for the logged-in user
2. Check that `attendance_records` table has entries for today
3. Verify the mapping exists and links to the correct branch

### Problem: Duplicate entries in reports

**Fix:**
- This is prevented by the `UNIQUE(user_type, user_id, attendance_date)` constraint
- Each user can only have ONE record per day
- Duplicate punches update the existing record (punch_in/punch_out)

### Problem: Build fails with module not found

**Fix:**
- Ensure all dependencies are installed: `npm install`
- Check import paths in API routes use relative paths (e.g., `../../../../src/lib/...`)
- Client components use `@/` alias (e.g., `@/lib/permissions`)

### Problem: Database writes are too frequent

**Architecture ensures minimal writes:**
- Sync logs are **batched** in memory (flushed every 30s)
- Device status update is **event-driven** via heartbeat trigger
- Processing happens in **single DB function call** (no round-trips)
- Duplicates are **rejected at DB level** (unique constraint + ON CONFLICT)

---

## Quick Reference

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| Device offline | No heartbeat | Touch fingerprint or send heartbeat API |
| Webhook 401 | Unknown device | Register device first |
| Webhook no_mapping | No PIN→user link | Create mapping from UI |
| No live feed | Realtime not enabled | Enable in Supabase → Replication |
| Stats = 0 | Wrong branch/missing data | Check branch_id and mappings |
| Duplicate records | Not possible | UNIQUE constraint prevents it |
