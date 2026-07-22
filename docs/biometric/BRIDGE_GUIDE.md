# Bridge Guide - Setup & Maintenance

## Installation
See `biometric-bridge/INSTALL.md` for detailed installation.

## Configuration
Edit `biometric-bridge/.env`:

```env
# Bridge Identity (each computer needs unique values)
BRIDGE_ID=bridge-main-office
COMPUTER_NAME=Main Office PC
SOFTWARE_VERSION=1.1.0

# Device Connection
DEVICE_IP=192.168.1.100
DEVICE_PORT=4370
DEVICE_SERIAL=K40-SN001

# Branch Association
BRANCH_ID=1

# Server Configuration
SERVER_URL=https://your-domain.com
API_KEY=Rahmana@1212

# Bridge Settings
POLL_INTERVAL_MS=5000
BATCH_SIZE=50
LOG_LEVEL=info
```

## Multi-Computer Setup
Each computer running a bridge needs its own `.env` file with unique values:

| Computer | BRIDGE_ID | DEVICE_IP | DEVICE_SERIAL | BRANCH_ID |
|----------|-----------|-----------|---------------|-----------|
| Main Campus | bridge-main | 192.168.1.100 | K40-SN001 | 1 |
| Girls Campus | bridge-girls | 192.168.1.200 | K40-SN002 | 2 |
| Admin Building | bridge-admin | 192.168.1.150 | K40-SN003 | 1 |

## Running
```bash
cd biometric-bridge
npm start
```

## Monitoring
- Status page: http://127.0.0.1:3470/status
- Logs: `biometric-bridge/bridge.log`
- Queue: `biometric-bridge/offline_queue.json`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bridge won't start | Check Node.js >= 14, check .env file |
| Device not connecting | Verify IP/port, check network connectivity |
| Attendance not syncing | Check SERVER_URL, verify API key |
| Queue growing | Check internet connectivity, server availability |
