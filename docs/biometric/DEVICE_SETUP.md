# ZKTeco K40 Device Setup Guide

## Prerequisites
- ZKTeco K40 device
- LAN connection to computer running bridge
- Admin access to device web interface

## Network Setup
1. Connect K40 to same LAN as bridge computer
2. Assign static IP to K40
3. Note the IP address and port (default: 4370)

## ADMS Configuration
1. Open ZKTeco ADMS software
2. Add device with IP and port
3. Configure push URL:
   ```
   https://your-domain.com/api/attendance/device
   ```

## Bridge Configuration
1. Install bridge on Windows PC (see INSTALL.md)
2. Configure `.env` with device IP and port
3. Start bridge: `npm start`

## Testing
1. Verify device connection in Admin Dashboard
2. Scan a fingerprint
3. Check live feed in Dashboard
4. Verify attendance record in Reports
