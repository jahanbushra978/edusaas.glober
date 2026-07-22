# Rahmania Institute - Biometric Bridge

A lightweight local bridge application that connects ZKTeco K40 biometric devices to the Rahmania Institute ERP system.

## Overview

The Biometric Bridge runs on a Windows computer connected to the ZKTeco K40 device via the local network. It reads attendance data from the device and sends it to the ERP server via secure API calls.

### Architecture

```
K40 Device  ───>  Local Computer (Bridge Service)  ───>  Next.js API  ───>  Supabase
```

The device **never** connects directly to the database. All data flows through the bridge application.

## Features

- Connects to ZKTeco K40 over TCP/IP
- Reads attendance punches
- Detects and filters duplicate entries
- Sends data to ERP API with secure authentication
- Offline queue: stores data locally when internet is unavailable
- Auto-sync: sends queued data when connection is restored
- Heartbeat monitoring
- Lightweight: minimal CPU/RAM usage
- Automatic reconnection on device or network failure

## Quick Start

1. Install Node.js (v14 or higher)
2. Copy `.env.example` to `.env` and configure
3. Run `npm install`
4. Run `node bridge.js`

## Documentation

- [Installation Guide](INSTALL.md) - Detailed setup instructions
- [Configuration Guide](CONFIG.md) - All configuration options
- [Troubleshooting](INSTALL.md#troubleshooting) - Common issues and solutions

## Project Structure

```
biometric-bridge/
├── bridge.js          # Main bridge application
├── package.json       # Dependencies
├── .env.example       # Environment configuration template
├── .env               # Your configuration (create from .env.example)
├── README.md          # This file
├── INSTALL.md         # Installation guide
├── CONFIG.md          # Configuration reference
├── bridge.log         # Log file (auto-created)
└── offline_queue.json # Offline queue (auto-created)
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/attendance/device` | POST | Send attendance punches |
| `/api/attendance/manage` | POST | Heartbeat and management |

## Security

All API requests include an `x-api-key` header for authentication. The server verifies this key on every request.
