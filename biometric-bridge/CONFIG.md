# Configuration Guide - Biometric Bridge

## Configuration File

The bridge uses a `.env` file for configuration. Copy `.env.example` to `.env` and edit the values.

## Configuration Options

### `DEVICE_IP` (Required)

The IP address of your ZKTeco K40 device on the local network.

**Example:**
```
DEVICE_IP=192.168.1.100
```

**How to find:**
1. On the K40 device, press `MENU` → `COMMUNICATION` → `NETWORK SETTINGS`
2. Look for `IP ADDRESS`
3. Alternatively, check your router's DHCP client list

### `DEVICE_PORT` (Optional)

The port number for the ZKTeco device communication. Default is 4370.

**Example:**
```
DEVICE_PORT=4370
```

**Note:** Most ZKTeco devices use port 4370. Only change this if you have configured a different port on the device.

### `SERVER_URL` (Required)

The full URL of your Rahmania Institute ERP server.

**Example:**
```
SERVER_URL=https://rahmania-institute.vercel.app
```

**Important:** Do NOT include a trailing slash.

### `API_KEY` (Required)

The secret authentication key. Must match the key expected by the ERP server.

**Default (Development):**
```
API_KEY=Rahmana@1212
```

**Production:** Change this to a secure random string and set it as an environment variable on your server.

### `POLL_INTERVAL_MS` (Optional)

How often (in milliseconds) the bridge checks the device for new attendance data.

**Default:** `5000` (5 seconds)

**Example:**
```
POLL_INTERVAL_MS=3000
```

**Recommendation:** 
- For real-time updates: `3000` (3 seconds)
- For normal use: `5000` (5 seconds)
- To reduce network load: `10000` (10 seconds)

### `BATCH_SIZE` (Optional)

Maximum number of attendance records to send in a single API request.

**Default:** `50`

**Example:**
```
BATCH_SIZE=100
```

### `LOG_LEVEL` (Optional)

Controls the verbosity of logging.

**Values:**
| Level | Description |
|-------|-------------|
| `error` | Only errors |
| `warn` | Errors and warnings |
| `info` | Normal operational logs (default) |
| `debug` | Detailed debug information |

**Example:**
```
LOG_LEVEL=info
```

## Multi-Computer / Multi-Branch Configuration

Each bridge instance can be configured for a specific computer and branch.

### `BRIDGE_ID` (Recommended)
Unique identifier for this bridge instance. Auto-generated from computer hostname if left empty.

**Example:** `BRIDGE_ID=bridge-main-office`

### `COMPUTER_NAME` (Recommended)
Human-readable name for the computer running this bridge.

**Example:** `COMPUTER_NAME=Main Office PC`

### `DEVICE_SERIAL` (Recommended)
The serial number of the connected ZKTeco device. Used to associate attendance with the correct device.

**Example:** `DEVICE_SERIAL=K40-SN12345`

### `BRANCH_ID` (Required for multi-branch)
The branch ID this bridge/device belongs to. Must match a branch ID in your institute system.

**Example:** `BRANCH_ID=1`

### `SOFTWARE_VERSION` (Optional)
Version identifier for the bridge software. Auto-reported to the admin panel.

**Default:** `1.1.0`

## Complete Examples

### Single Computer, Single Branch
```env
DEVICE_IP=192.168.1.100
DEVICE_PORT=4370
DEVICE_SERIAL=K40-SN001
BRANCH_ID=1
SERVER_URL=https://rahmania-institute.vercel.app
API_KEY=Rahmana@1212
POLL_INTERVAL_MS=5000
BATCH_SIZE=50
LOG_LEVEL=info
```

### Multiple Computers, Multiple Branches
**Computer 1 (Branch 1 - Main Campus):**
```env
BRIDGE_ID=bridge-campus-main
COMPUTER_NAME=Main Campus Server
DEVICE_IP=192.168.1.100
DEVICE_PORT=4370
DEVICE_SERIAL=K40-SN001
BRANCH_ID=1
SERVER_URL=https://rahmania-institute.vercel.app
API_KEY=Rahmana@1212
```

**Computer 2 (Branch 2 - Girls Campus):**
```env
BRIDGE_ID=bridge-campus-girls
COMPUTER_NAME=Girls Campus Server
DEVICE_IP=192.168.1.200
DEVICE_PORT=4370
DEVICE_SERIAL=K40-SN002
BRANCH_ID=2
SERVER_URL=https://rahmania-institute.vercel.app
API_KEY=Rahmana@1212
```

## Environment Variables on Server (Production)

1. **Development:** Use `Rahmana@1212` for testing
2. **Production:** Always change to a strong, random API key
3. **Network:** Keep the bridge computer on the same secure local network as the device
4. **Firewall:** Restrict access to port 3470 (status server) to localhost only
