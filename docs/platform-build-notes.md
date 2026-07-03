# Platform Build Notes

## Release Order

1. Web offline build.
2. Windows desktop through Tauri.
3. Android after Android Studio, SDK, NDK, and signing are configured.
4. macOS and iOS after Mac hardware, Xcode, signing certificates, and Apple Developer access are available.

## Web

- Build with `npm run build`.
- Verify local/offline assets with `npm run test:offline-build`.
- Output is `dist/web`.

## Windows

- Requires Rust, Microsoft C++ Build Tools, and Microsoft Edge WebView2.
- Development: `npm run tauri:dev`.
- Release build: `npm run tauri:build`.
- Tauri config points at `../dist/web` through `build.frontendDist`.

## Android

- Requires Android Studio, Android SDK, Android NDK, Java/Kotlin toolchains, and signing setup.
- Tauri identifier `com.quantumgarden.clean` is the shared Android package id and iOS bundle id.
- Development command: `npm run tauri:android:dev`.
- Release command: `npm run tauri:android:build`.
- Do not mark Android release complete until an emulator and a physical device have been tested.

## macOS And iOS

- macOS and iOS builds require macOS and Xcode.
- Distribution requires Apple Developer enrollment and signing/provisioning setup.
- iOS Tauri commands are only available on macOS hosts.
- Do not mark macOS or iOS release tasks complete until Mac hardware, Xcode, signing certificates, and Apple Developer access are available.
- Development command: `npm run tauri:ios:dev`.
- Release command: `npm run tauri:ios:build`.

Sources checked while scaffolding:

- Tauri v2 prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri v2 configuration files: https://v2.tauri.app/develop/configuration-files/
- Tauri v2 CLI reference: https://v2.tauri.app/reference/cli/
- Tauri App Store requirements: https://v2.tauri.app/distribute/app-store/
