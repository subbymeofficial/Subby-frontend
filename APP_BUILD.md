# SubbyMe — Mobile App Build Runbook

This repo is a Vite + React web app wrapped with **Capacitor** to ship as a native iOS and Android app. Single codebase, two App Store listings.

## Prerequisites

| Tool | Version | Where |
| --- | --- | --- |
| Node | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Xcode | 15+ | Mac App Store (iOS only) |
| Android Studio | Hedgehog / Iguana+ | developer.android.com |
| CocoaPods | 1.14+ | `sudo gem install cocoapods` (iOS only) |
| Apple Developer account | — | $99 USD / yr |
| Google Play Console | — | $25 USD one-time |

## One-time setup

```bash
# from repo root
npm install
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

The `ios/` and `android/` native project folders will be generated. Commit them — they're part of the repo.

## Day-to-day workflow

Any time you change the React code:

```bash
npm run cap:sync     # vite build && npx cap sync
```

Then open the native IDE and Run:

```bash
npm run cap:ios      # opens Xcode
npm run cap:android  # opens Android Studio
```

## Native features wired in

The app uses these Capacitor plugins:

- **Push Notifications** (`@capacitor/push-notifications`) — registered on login via `AuthContext`, POSTs `{ token, platform }` to `/push-tokens`.
- **Camera** (`@capacitor/camera`) — used by `ProfileImageUpload`. Prompts user to pick Camera or Photos on mobile.
- **Geolocation** (`@capacitor/geolocation`) — "Use my location" button in `LocationSelect`. Reverse-geocodes via OpenStreetMap Nominatim.

All three gracefully fall back to browser APIs on web builds, so there's no branching logic needed in feature code.

## Required config

### iOS — `ios/App/App/Info.plist`

Add these keys for App Store submission:

```xml
<key>NSCameraUsageDescription</key>
<string>SubbyMe uses the camera to take profile photos and capture verification tickets.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>SubbyMe lets you pick a profile photo and verification documents from your library.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>SubbyMe uses your location to find contractors and jobs near you.</string>
```

Enable **Push Notifications** capability: `ios/App/App.xcworkspace` → target App → Signing & Capabilities → "+ Capability" → Push Notifications.

Upload an **APNs Auth Key** (`.p8`) in your backend push provider (Firebase or equivalent) so the server can send to iOS devices.

### Android — `android/app/src/main/AndroidManifest.xml`

Capacitor adds most permissions automatically via `npx cap sync`. Confirm these are present:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

Drop the Firebase `google-services.json` into `android/app/` for FCM push.

## App identity

- **Bundle ID / App ID:** `com.subbyme.app`
- **App name:** SubbyMe
- **Web root (dist):** `dist/`
- **Config file:** `capacitor.config.ts`

## Icons and splash

Generate once from a 1024×1024 master and a 2732×2732 splash:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

Drop your PNGs in `resources/` — the generator fans out every size iOS/Android needs.

## iOS App Store submission

1. In Xcode: Product → Archive. Wait for the organizer to open.
2. Distribute App → App Store Connect → Upload.
3. In App Store Connect:
   - New version → fill metadata, screenshots (6.7", 6.5", 5.5").
   - Privacy Nutrition Labels: declare Camera, Location, Push.
   - Submit for review.
4. Expected review time: 24–48 hours.

## Google Play submission

1. In Android Studio: Build → Generate Signed Bundle / APK → **Android App Bundle** (.aab). Use a keystore you keep safe — losing it means losing the ability to update the app.
2. In Play Console:
   - Create new release on the Internal testing track first.
   - Fill Data Safety form (declare camera, location, notifications, any analytics).
   - Upload the `.aab`.
3. Promote Internal → Closed → Production once tested.

## Testing checklist before submitting

- [ ] Login / register flow works on a physical device (not just simulator).
- [ ] Profile photo upload via camera and via library.
- [ ] "Use my location" populates Country / State / City on the LocationSelect.
- [ ] Push token is received after first login (check `/push-tokens` POST in network log).
- [ ] Deep links from email open the app if configured.
- [ ] Dark mode rendering on iOS and Android.
- [ ] Safe-area insets on notched phones (the `capacitor.config.ts` sets `contentInset: 'automatic'` which handles most cases).

## Troubleshooting

- **White screen on launch:** usually means `webDir` in `capacitor.config.ts` points somewhere that doesn't have an `index.html`. Confirm `npm run build` produced `dist/index.html`, then `npx cap sync` again.
- **CocoaPods errors on first `cap sync`:** `cd ios/App && pod install` manually, then reopen Xcode.
- **Android Gradle sync fails:** open `android/` in Android Studio and let it download the SDK it complains about.
- **Push token never arrives on iOS:** physical device required (simulators don't do APNs), and the device needs internet + the app must be signed with a provisioning profile that includes the Push Notifications entitlement.

## Backend TODO (blocks push)

The frontend POSTs to `POST /push-tokens` with `{ token, platform }`. The backend needs:

- `POST /push-tokens` — upsert `{ userId, deviceToken, platform, updatedAt }`.
- `DELETE /push-tokens/:token` — remove on logout.
- A worker that fans out notifications (new message, new application, booking reminder) through Firebase Cloud Messaging — FCM handles both Android and iOS via APNs key upload.

Everything else (React app, icons, Capacitor plumbing) is ready to ship the moment those backend routes exist.
