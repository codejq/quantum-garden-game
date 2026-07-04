# Clean Garden

Clean Garden is an offline 3D garden cleanup and tree planting game credited to [Quantum Billing LLC](https://qb-solutions.us/).

The game is built with plain browser JavaScript, local Three.js r128 assets, Vite, and Tauri v2. It supports desktop, mobile touch, keyboard, mouse, single-player, simultaneous two-player play, localized UI, seeded level attempts, score memory, avatar customization, and an LLM-friendly browser control hook.

## Features

- Offline-first browser and Tauri builds.
- English by default, plus Arabic, Spanish, and French.
- Single-player and simultaneous two-player modes.
- Keyboard, mouse, and touch controls.
- Seeded randomized levels with teardown and replay-friendly state.
- Saved best, last, and total score data.
- Avatar gender and clothing options.
- `window.QuantumGardenAgent` API for model-driven play and testing.

## Requirements

- Node.js 24.
- Rust stable.
- Tauri v2 prerequisites for the target platform.
- Android Studio, Android SDK, Android NDK, and Java 17 for Android builds.
- macOS, Xcode, and Apple signing access for macOS/iOS builds.

## Local Development

```powershell
npm ci
npm run dev
```

## Test And Build

```powershell
npm test
npm run test:offline-build
npm run build
npm run tauri:build
```

Android:

```powershell
npm run tauri:android:build
```

iOS, on macOS with Xcode:

```bash
npm run tauri:ios:build
```

## Build Outputs

- Web: `dist/web`
- Windows desktop app: `src-tauri/target/release/clean-garden.exe`
- Windows installers: `src-tauri/target/release/bundle`
- Android APK: `src-tauri/gen/android/app/build/outputs/apk`
- Android AAB: `src-tauri/gen/android/app/build/outputs/bundle`

## GitHub Workflows

- `CI`: runs tests and offline build checks.
- `Build Platforms`: builds web, Windows, Linux, macOS, and Android artifacts on release tags, and can also run manually.
- `Android Market Release`: builds signed Android artifacts, creates a GitHub Release, and can publish the AAB to Google Play if the Play secret is configured.
- `F-Droid Repository`: publishes the signed release APK into `docs/fdroid/` for GitHub Pages hosting after the Android release workflow succeeds.

## Release Secrets

Android signing:

- `ANDROID_KEYSTORE_BASE64`: base64 encoded Android release keystore.
- `ANDROID_KEYSTORE_PASSWORD`: Android keystore password.
- `ANDROID_KEY_ALIAS`: Android key alias.
- `ANDROID_KEY_PASSWORD`: Android key password.

The Android release workflow also accepts the legacy names from the copied workflow: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD`.

If Android signing secrets are absent, CI generates a temporary release key so a first APK can still be produced. Configure real signing secrets before relying on app updates, because Android requires every future update to use the same signing key.

Google Play publishing:

- `GOOGLE_PLAY_JSON_KEY`: Google Play service account JSON.

F-Droid repository signing:

- `FDROID_KEYSTORE_BASE64`: base64 encoded F-Droid repo keystore.
- `FDROID_KEYSTORE_PASS`: F-Droid repo keystore password.

If F-Droid repo signing secrets are absent, CI generates a temporary repo key for the current publication. Configure the real F-Droid repo key before giving the repo URL to users.

The Android package id and iOS bundle id are `com.quantumbilling.cleangarding`.

## Documentation

- [Project context](docs/project-context.md)
- [Platform build notes](docs/platform-build-notes.md)
- [Release checklist](docs/release-checklist.md)
- [Roadmap](docs/modular-offline-tauri-roadmap.md)
