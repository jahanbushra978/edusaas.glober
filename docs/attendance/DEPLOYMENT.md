# ZKTeco K40 Attendance System — Deployment Guide

## 1. Supabase Setup

### Step 1.1: Run the migration

1. Open your Supabase dashboard → **SQL Editor**
2. Copy the entire contents of `supabase/migrations/create_attendance_system.sql`
3. Paste and run

This creates all 6 tables, indexes, RLS policies, functions, and triggers.

### Step 1.2: Enable Realtime (optional, for live feed)

1. Supabase dashboard → **Database** → **Replication**
2. Enable Realtime for table: `attendance_logs`
3. Set event: **Insert** only

### Step 1.3: Verify tables

Run this query in Supabase SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'attendance_%'
ORDER BY table_name;
```

Expected output:
```
attendance_device_heartbeats
attendance_devices
attendance_logs
attendance_records
attendance_sync_logs
device_user_mappings
```

---

## 2. Application Configuration

### Step 2.1: Environment Variables

Ensure these are set in your deployment platform (Vercel, Railway, etc.):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yfwqbttpkugqkcpdyhum.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_URL` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |

### Step 2.2: Build & Deploy

```bash
npm run build
npm run start
```

For Vercel:
```bash
vercel --prod
```

For Railway:
```bash
railway up
```

---

## 3. ZKTeco K40 ADMS Configuration

### Step 3.1: Access the device

1. Connect K40 to your LAN
2. Find its IP (check router DHCP list or use ZKTeco software)
3. Open browser and navigate to: `http://<device-ip>/`

### Step 3.2: Configure Push Mode (ADMS)

1. Go to **Network Settings** → **Push Mode**
2. Enable **ADMS (Attendance Data Management System)**
3. Set **Server URL** to:

```
https://your-domain.com/api/attendance/device
```

4. Set **Port**: `443` (HTTPS)
5. Set **Push Interval**: `0` (real-time, event-driven)
6. Set **Authentication**: If you configured a `webhook_secret`, set it as Bearer token

### Step 3.3: Register users in device

1. Go to **User Management** → **Add User**
2. For each user, assign:
   - **User ID / PIN**: A unique number (e.g., `101`, `102`, ...)
   - **Name**: User's name
   - **Fingerprint**: Enroll fingerprint
3. **IMPORTANT**: This same PIN must be used in the `device_user_mappings` table via the UI

### Step 3.4: Verify connectivity

1. In the app: Admin Dashboard → **Biometric Attendance** → **Devices**
2. Device should appear with status `online` after first heartbeat
3. Touch a fingerprint — the **Dashboard** tab should show it in **Live Feed** within seconds

---

## 4. First-Time Setup Workflow

1. **Register device** → Devices tab → "Register Device"
2. **Test webhook** → Touch a fingerprint, check Live Feed or Sync Logs
3. **Add mappings** → Mappings tab → "Add Mapping" — link each device PIN to a student/teacher
4. **Verify attendance** → Reports tab → Generate report for today
5. **Train users** → Ensure all staff/students enroll fingerprints on the K40
