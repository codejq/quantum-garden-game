import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const tauriConfig = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const cargoToml = readFileSync(new URL('../src-tauri/Cargo.toml', import.meta.url), 'utf8');
const notes = readFileSync(new URL('../docs/platform-build-notes.md', import.meta.url), 'utf8');
const releaseChecklist = readFileSync(new URL('../docs/release-checklist.md', import.meta.url), 'utf8');

test('platform notes document desktop and mobile build commands', () => {
  assert.equal(packageJson.scripts['tauri:android:dev'], 'tauri android dev');
  assert.equal(packageJson.scripts['tauri:android:build'], 'tauri android build');
  assert.equal(packageJson.scripts['tauri:ios:dev'], 'tauri ios dev');
  assert.equal(packageJson.scripts['tauri:ios:build'], 'tauri ios build');
  assert.match(notes, /Development command: `npm run tauri:android:dev`/);
  assert.match(notes, /Release command: `npm run tauri:android:build`/);
  assert.match(notes, /Development command: `npm run tauri:ios:dev`/);
  assert.match(notes, /Release command: `npm run tauri:ios:build`/);
});

test('Android and iOS build paths are documented and configured', () => {
  assert.equal(tauriConfig.build.frontendDist, '../dist/web');
  assert.equal(tauriConfig.identifier, 'com.quantumbilling.cleangarding');
  assert.match(notes, /Android build path is configured through `package\.json` Tauri Android scripts plus `src-tauri\/tauri\.conf\.json`/);
  assert.match(notes, /iOS build path is configured through `package\.json` Tauri iOS scripts plus `src-tauri\/tauri\.conf\.json`/);
});

test('Android Tauri project scaffold is generated', () => {
  assert.equal(existsSync(new URL('../src-tauri/gen/android/settings.gradle', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src-tauri/gen/android/app/build.gradle.kts', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src-tauri/gen/android/app/src/main/AndroidManifest.xml', import.meta.url)), true);

  const androidGradle = readFileSync(new URL('../src-tauri/gen/android/app/build.gradle.kts', import.meta.url), 'utf8');
  const androidActivity = readFileSync(
    new URL('../src-tauri/gen/android/app/src/main/java/com/quantumbilling/cleangarding/MainActivity.kt', import.meta.url),
    'utf8',
  );

  assert.match(androidGradle, /namespace = "com\.quantumbilling\.cleangarding"/);
  assert.match(androidGradle, /applicationId = "com\.quantumbilling\.cleangarding"/);
  assert.match(androidActivity, /package com\.quantumbilling\.cleangarding/);
});

test('Android app icons, splash, and release signing are configured', () => {
  const androidGradle = readFileSync(new URL('../src-tauri/gen/android/app/build.gradle.kts', import.meta.url), 'utf8');
  const androidManifest = readFileSync(new URL('../src-tauri/gen/android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8');
  const androidTheme = readFileSync(new URL('../src-tauri/gen/android/app/src/main/res/values/themes.xml', import.meta.url), 'utf8');
  const androidV31Theme = readFileSync(new URL('../src-tauri/gen/android/app/src/main/res/values-v31/themes.xml', import.meta.url), 'utf8');
  const launchScreen = readFileSync(new URL('../src-tauri/gen/android/app/src/main/res/drawable/launch_screen.xml', import.meta.url), 'utf8');
  const releaseChecklist = readFileSync(new URL('../docs/release-checklist.md', import.meta.url), 'utf8');

  assert.match(androidManifest, /android:icon="@mipmap\/ic_launcher"/);
  assert.match(androidManifest, /android:roundIcon="@mipmap\/ic_launcher_round"/);
  assert.match(androidTheme, /android:windowBackground">@drawable\/launch_screen/);
  assert.match(androidV31Theme, /android:windowSplashScreenAnimatedIcon">@drawable\/clean_garden_splash_icon/);
  assert.match(launchScreen, /@color\/splash_background/);
  assert.match(launchScreen, /@drawable\/clean_garden_splash_icon/);
  assert.match(androidGradle, /ANDROID_KEYSTORE_PATH/);
  assert.match(androidGradle, /create\("releaseEnv"\)/);
  assert.match(androidGradle, /signingConfig = signingConfigs\.getByName\("releaseEnv"\)/);
  assert.match(releaseChecklist, /ANDROID_KEYSTORE_PATH/);
});

test('Tauri identifier defines Android package id and iOS bundle id', () => {
  assert.equal(tauriConfig.identifier, 'com.quantumbilling.cleangarding');
  assert.match(notes, /Tauri identifier `com\.quantumbilling\.cleangarding` is the shared Android package id and iOS bundle id/);
});

test('Apple platform work remains gated until hardware and account access exist', () => {
  assert.match(notes, /macOS and iOS builds require macOS and Xcode/);
  assert.match(notes, /Apple Developer enrollment/);
  assert.match(notes, /Do not mark macOS or iOS release tasks complete until Mac hardware, Xcode, signing certificates, and Apple Developer access are available/);
});

test('target Tauri version is confirmed before mobile setup', () => {
  assert.match(packageJson.devDependencies['@tauri-apps/cli'], /^\^2\./);
  assert.match(cargoToml, /tauri = \{ version = "2"/);
  assert.match(cargoToml, /tauri-build = \{ version = "2"/);
  assert.match(notes, /Target Tauri version: v2/);
});

test('release checklist documents selected targets and gated platforms', () => {
  assert.match(releaseChecklist, /current verified release targets are offline web and Windows desktop/);
  assert.match(releaseChecklist, /Run `npm test`/);
  assert.match(releaseChecklist, /Run `npm run test:offline-build`/);
  assert.match(releaseChecklist, /Run `npm run tauri:build`/);
  assert.match(releaseChecklist, /Run `npm run test:tauri-launch`/);
  assert.match(releaseChecklist, /Run `npm run test:tauri-install`/);
  assert.match(releaseChecklist, /Launch the packaged app with the network disabled and complete one single-player level/);
  assert.match(releaseChecklist, /Change language, quality, and view preset, then relaunch/);
  assert.match(releaseChecklist, /Run the LLM harness smoke path/);
  assert.match(releaseChecklist, /Android is scaffolded and its build path is proven/);
  assert.match(releaseChecklist, /macOS and iOS remain gated/);
});
