# Tindog Mobile

Expo/React Native app for Tindog on Android and iOS using a custom development build.

This project currently targets Expo SDK 57. Google Sign-In and SecureStore require native modules, so Expo Go is not a compatible runtime for the authenticated app.

## Run

```bash
cd apps/mobile
npm run start:dev-client
```

If the phone cannot connect over the same Wi-Fi network:

```bash
npm run start:tunnel
```

## First Android development build

Create an installable APK with EAS:

```bash
npm run build:android:dev
```

Install the APK returned by EAS on the phone. Rebuild it whenever a native dependency or `app.json` changes.

## Run on Android

1. Connect the phone and this PC to the same Wi-Fi network.
2. Run `npm run start:dev-client` or the root `restart.bat`.
3. Open the installed **Tindog** development app, not Expo Go.
4. Scan the development-client QR or enter the URL shown by Metro.

An `exp://...` URL opens Expo Go and cannot load `RNGoogleSignin`. The development-client QR uses the `tindog` application scheme.

## Google OAuth

Local variables live in `apps/mobile/.env`:

```text
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
```

The same public variables must exist in the EAS `development`, `preview`, and `production` environments before creating cloud builds.
