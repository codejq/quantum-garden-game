# Release Checklist

Use this checklist for each release candidate. The current verified release targets are offline web and Windows desktop. Android is scaffolded but not release-ready until the Android build, emulator, and physical-device checks pass. macOS and iOS remain gated until macOS, Xcode, signing certificates, provisioning profiles, and Apple Developer access are available.

## Required Verification

- Run `npm test`.
- Run `npm run test:offline-build`.
- Run `npm run tauri:build` on the target desktop host.
- Run `npm run test:tauri-launch` after a desktop bundle exists.
- Run `npm run test:tauri-install` on Windows when the NSIS bundle exists.
- Launch the packaged app with the network disabled and complete one single-player level.
- Change language, quality, and view preset, then relaunch and verify settings still load.
- Start a two-player race and verify both players receive the same seed and a winner is declared.
- Run the LLM harness smoke path and verify it can reset, observe, act, and step without DOM or WebGL access.

## Web Offline Release

- Build command: `npm run build`.
- Output directory: `dist/web`.
- Verification command: `npm run test:offline-build`.
- Distribution artifact: archive the contents of `dist/web`.
- Offline requirement: no runtime requests to CDN, Google Fonts, or external media.

## Windows Release

- Build command: `npm run tauri:build`.
- Expected bundle directory: `src-tauri/target/release/bundle`.
- Smoke launch command: `npm run test:tauri-launch`.
- Install smoke command: `npm run test:tauri-install`.
- Distribution artifact: use the generated Windows installer from the Tauri bundle output.
- Exit requirement: the in-game exit button must close or return from the packaged app without stale timers.

## Android Gate

- Setup status: Tauri Android project scaffold exists under `src-tauri/gen/android`.
- Build command: `npm run tauri:android:build`.
- Dev command: `npm run tauri:android:dev`.
- Latest host check: symbolic links can now be created on this Windows host.
- Latest build attempt: `npm run tauri:android:build` on 2026-07-04 completed and produced `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk` and `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`.
- Release remains blocked until a WebView smoke run is verified on an emulator or device.
- Do not release until emulator and physical-device smoke tests pass.
- No Android device is connected and `emulator -list-avds` currently returns no configured AVD.
- App icon and splash resources are configured in `src-tauri/gen/android/app/src/main/res`.
- Release signing is configured through `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`; do not store keystores or passwords in the repo.

## macOS Gate

- Build command on macOS: `npm run tauri:build`.
- Release remains blocked until a macOS host is available.
- Do not release until app launch, offline play, signing, and notarization are verified.

## iOS Gate

- Dev command on macOS: `npm run tauri:ios:dev`.
- Build command on macOS: `npm run tauri:ios:build`.
- Latest Windows host check: `npm exec -- tauri ios --help` on 2026-07-04 failed with `unrecognized subcommand 'ios'`, confirming iOS work must move to macOS/Xcode.
- Release remains blocked until macOS, Xcode, provisioning profiles, and Apple Developer access are available.
- Do not release until simulator and physical-device smoke tests pass.
- Do not release until launch assets, signing, and provisioning are configured.
