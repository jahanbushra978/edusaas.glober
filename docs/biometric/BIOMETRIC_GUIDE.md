# Biometric Module Guide

## Architecture

```
ZKTeco K40 Device
  ↓ TCP/IP (port 4370)
Biometric Bridge (local Windows service)
  ↓ HTTP POST (x-api-key auth)
Next.js API Routes
  ↓ Supabase RPC
PostgreSQL Database
```

## Components

### Bridge Service (`biometric-bridge/bridge.js`)
- Runs on Windows PC connected to ZKTeco K40
- Polls device every 5 seconds
- Sends heartbeats every 60 seconds
- Offline queue with auto-sync
- Status server on 127.0.0.1:3470

### Database Tables
| Table | Purpose |
|-------|---------|
| `attendance_devices` | Registered devices |
| `device_user_mappings` | PIN → user mapping |
| `attendance_logs` | Raw punch events |
| `attendance_records` | Processed daily records |
| `biometric_profiles` | User biometric config |
| `attendance_sync_logs` | Audit trail |
| `attendance_device_heartbeats` | Health checks |

## Key Features
- Duplicate detection (1-min window + packet_id)
- Offline queue with persistence
- Auto-reconnect on connection loss
- Real-time dashboard updates
