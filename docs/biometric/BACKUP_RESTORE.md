# Backup & Restore Guide

## Database Backup

### Via Supabase Dashboard
1. Go to Supabase → Database → Backups
2. Enable Point-in-Time Recovery (PRO plan)
3. Download manual backups as needed

### Via pg_dump
```bash
pg_dump --dbname=your_connection_string \
  --table=attendance_devices \
  --table=device_user_mappings \
  --table=attendance_logs \
  --table=attendance_records \
  --table=attendance_sync_logs \
  --table=attendance_device_heartbeats \
  --table=biometric_profiles \
  > biometric_backup.sql
```

## Bridge Backup
Backup these files:
- `biometric-bridge/.env` (configuration)
- `biometric-bridge/offline_queue.json` (queued data)

## Restore

### Database Restore
```bash
psql --dbname=your_connection_string < biometric_backup.sql
```

### Bridge Restore
1. Copy `.env` and `offline_queue.json` to bridge directory
2. Restart bridge service

## Schedule
- Database: Daily automatic (Supabase)
- Configuration: After any change
- Test restore: Monthly
