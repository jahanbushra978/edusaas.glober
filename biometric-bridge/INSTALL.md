# Installation Guide - Biometric Bridge

## Prerequisites

1. **Windows Computer** (Windows 7, 8, 10, or 11)
2. **Node.js** (v14 or higher) 
3. **Network connection** to the ZKTeco K40 device
4. **Internet connection** to reach the ERP server

## Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Make sure to check "Add to PATH" during installation
4. Verify installation by opening Command Prompt and typing:
   ```
   node --version
   npm --version
   ```
   Both should show version numbers.

## Step 2: Extract the Bridge Files

1. Copy the entire `biometric-bridge` folder to the computer that will run the bridge
2. Recommended location: `C:\Program Files\Rahmania\biometric-bridge\`

## Step 3: Install Dependencies

Open Command Prompt in the bridge folder:

```bash
cd "C:\Program Files\Rahmania\biometric-bridge"
npm install
```

This will install the required dependencies (node-fetch for HTTP requests).

## Step 4: Configure

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` with your settings (see [CONFIG.md](CONFIG.md) for details):
   - `DEVICE_IP` - Set to your K40 device's IP address
   - `DEVICE_PORT` - Usually 4370
   - `SERVER_URL` - Your ERP server URL
   - `API_KEY` - The secret key for authentication

## Step 5: Test the Connection

Start the bridge to test:

```bash
node bridge.js
```

You should see output like:
```
[INFO] Connecting to device at 192.168.1.100:4370...
[INFO] Device connected (HTTP 200)
[INFO] Bridge started successfully
```

Press `Ctrl+C` to stop.

## Step 6: Set Up Auto-Start (Windows)

### Method 1: Windows Task Scheduler (Recommended)

1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Click "Create Task" on the right panel
3. **General tab:**
   - Name: "Rahmania Biometric Bridge"
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"
4. **Triggers tab:**
   - Click "New..."
   - Begin the task: "At startup"
   - Click OK
5. **Actions tab:**
   - Click "New..."
   - Action: "Start a program"
   - Program/script: `C:\Program Files\nodejs\node.exe`
   - Arguments: `bridge.js`
   - Start in: `C:\Program Files\Rahmania\biometric-bridge`
   - Click OK
6. **Conditions tab:**
   - Uncheck "Stop if the computer switches to battery power"
7. Click OK to create the task

### Method 2: Startup Folder

1. Press `Win + R`, type `shell:startup`, press Enter
2. Create a new text file named `start-bridge.bat`
3. Edit it with:
   ```batch
   @echo off
   cd /d "C:\Program Files\Rahmania\biometric-bridge"
   node bridge.js
   ```

### Method 3: NSSM (Non-Sucking Service Manager)

Download NSSM from https://nssm.cc/ and run:
```bash
nssm install "RahmaniaBiometricBridge" "C:\Program Files\nodejs\node.exe" "C:\Program Files\Rahmania\biometric-bridge\bridge.js"
nssm start "RahmaniaBiometricBridge"
```

## Step 7: Verify It's Running

Open a browser and visit:
```
http://127.0.0.1:3470/status
```

You should see a JSON response with bridge status including:
- Device connection status
- Queue length
- Statistics (punches sent, failures, etc.)

## Troubleshooting

### Device Not Connecting

1. **Verify IP Address:**
   ```bash
   ping 192.168.1.100
   ```
   (Replace with your device's IP)

2. **Check if device is accessible:**
   ```bash
   telnet 192.168.1.100 4370
   ```
   If telnet connects, the device is reachable.

3. **Firewall:** Make sure Windows Firewall allows connections to port 4370

4. **Network:** Ensure both devices are on the same network subnet

### Server Connection Failed

1. **Check URL:** Make sure `SERVER_URL` is correct (no trailing slash)
2. **Check API Key:** Verify `API_KEY` matches the server's expected key
3. **Internet:** Ensure the computer has internet access
4. **Test with curl:**
   ```bash
   curl -X POST https://your-server.com/api/attendance/manage -H "Content-Type: application/json" -H "x-api-key: Rahmana@1212" -d "{\"action\":\"heartbeat\",\"data\":{\"device_serial\":\"test\",\"status\":\"online\"}}"
   ```

### Duplicate Attendance

The bridge automatically filters duplicates within a 1-minute window. If duplicates still appear:
1. Check the `bridge.log` file for duplicate detection messages
2. Adjust dedup window if needed

### Log File

The bridge creates `bridge.log` in its folder. Check this file for detailed error information.

### Status Page

Visit `http://127.0.0.1:3470/status` for real-time status information including:
- Device connection status
- Total punches received
- Total punches sent
- Queue size
- Uptime
