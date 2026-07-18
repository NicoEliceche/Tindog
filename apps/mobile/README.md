# Tindog Mobile

Expo/React Native app for testing Tindog on Android and iOS through Expo Go.

This project targets Expo SDK 54 because Expo recommends SDK 54 for testing with Expo Go on physical devices during the SDK 57 transition period.

## Run

```bash
cd apps/mobile
npm run start:lan
```

If the phone cannot connect over the same Wi-Fi network:

```bash
npm run start:tunnel
```

## Android With Expo Go

1. Connect the phone and this PC to the same Wi-Fi network.
2. Open Expo Go on Android.
3. Scan the QR code printed by Expo CLI, or enter the LAN URL manually.

Current LAN server used during setup:

```text
exp://192.168.1.25:8083
```

If the PC IP changes, restart `npm run start:lan` and use the new QR/URL from Expo CLI.
