# Admin Guide - Biometric Attendance System

## Overview
The Biometric Attendance System integrates ZKTeco K40 fingerprint devices with the Rahmania Institute ERP. This guide covers admin operations.

## Access
1. Login as Admin or Branch Admin
2. Navigate to Attendance section
3. Access tabs: Dashboard, Devices, Mappings, Reports, Logs

## Dashboard
- View real-time attendance stats (present/late counts)
- Monitor live feed of incoming punches
- Auto-refreshes via Supabase Realtime

## Device Management
- **Register Device**: Enter serial number, name, branch, IP, port
- **Test Connection**: Enter IP, click "Test Connection"
- **Delete Device**: Removes device and all mappings (CASCADE)

## Mapping Management
- Link device PIN numbers to system users
- Load unmapped students for easy selection
- Bulk import via CSV/Excel

## Reports
- Filter by date range, user type, status
- Generate attendance reports
- View individual user attendance
- Export to CSV

## Security
- All attendance APIs require authentication
- Webhook endpoint validates device serial + secret
- Rate limited: 20 requests/second/IP
