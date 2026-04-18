# Deploying Jyotish Guru to Google Play Store

## One-time setup (you must do these first)

### 1. Create a Play Console account
- Go to https://play.google.com/console
- Pay the one-time $25 registration fee
- Complete identity verification

### 2. Manually create the app listing (Play Store does NOT allow the first upload via API)
- In Play Console, create a new app named "Jyotish Guru"
- Package name: `vincom.jyotishguru.app` (must match exactly)
- Upload `JyotishGuru-v1.0.aab` manually to the Internal Testing track
- Fill in required metadata: description, screenshots, content rating, privacy policy URL, data safety form
- Submit for review (Internal Testing typically approves within a few hours)

### 3. Create a Google Play API service account
Fastlane uploads through this service account. You only need to do this once.

1. In Play Console: Settings → Developer account → API access
2. Click "Link" next to Google Cloud, create a new project
3. Under "Service accounts", click "Create new service account"
4. This opens Google Cloud Console. Create the service account with role "Service Account User"
5. After creating: Actions → Manage keys → Add key → JSON → Download
6. In Play Console (back on the API access page): grant this service account "Release manager" permissions for your app
7. Save the downloaded JSON as: `android/play-store-service-account.json`

**NEVER commit this file to git — it's in `.gitignore`.**

### 4. Verify the setup
```bash
cd android
fastlane validate
```
You should see `The service account key is valid`.

---

## Daily workflow

All commands run from `android/`.

### Build a signed AAB locally (no upload)
```bash
fastlane build
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Push to Internal Testing (your personal testing)
```bash
fastlane internal
```
Automatically bumps `versionCode`, builds, and uploads as a draft. You can promote it to testers in Play Console.

### Push to Closed Alpha (trusted testers with email)
```bash
fastlane alpha
```

### Push to Open Beta (anyone with the link)
```bash
fastlane beta
```

### Push to Production (public, after review)
```bash
fastlane production
```
Uploaded as draft — you must still manually click "Release" in Play Console.
To auto-publish, edit `Fastfile` and change `release_status: "draft"` to `release_status: "completed"`.

### Update listing metadata (description, screenshots)
Edit files in `fastlane/metadata/android/en-US/`:
- `title.txt` — app title (max 50 chars)
- `short_description.txt` — short blurb (max 80 chars)
- `full_description.txt` — full description (max 4000 chars)
- `changelogs/<versionCode>.txt` — what's new for that version
- `images/phoneScreenshots/` — drop 2–8 PNG screenshots (min 320px, max 3840px)

Then:
```bash
fastlane metadata
```

---

## Screenshot requirements

Play Store requires at least 2 phone screenshots. Recommended:
- Aspect ratio between 9:16 and 16:9
- Min dimension 320px, max 3840px
- PNG or JPEG
- Drop files as `1.png`, `2.png`, ... in `fastlane/metadata/android/en-US/images/phoneScreenshots/`

---

## Required before first submission

Play Store will require:
- **Privacy policy URL** — publish a simple page; you can use `https://astro-xi-eight.vercel.app/privacy`
- **Content rating** — fill out the IARC questionnaire in Play Console (takes 5 min)
- **Target audience** — declare age ranges
- **Data safety form** — what data you collect, how you use it. For Jyotish Guru: email (account), birth details (used for chart calculation), messages (stored for conversation continuity), no third-party sharing except DeepSeek AI for chat
- **App category**: Lifestyle
- **App icon**: 512x512 PNG (use the vector launcher icon as reference)
- **Feature graphic**: 1024x500 PNG (shows at top of Play Store listing)

---

## Signing keystore — CRITICAL

The keystore at `android/jyotishguru-release.keystore` (password: `jyotishguru2026`, key alias: `jyotishguru`) is what Play Store uses to verify you own this app. **If you lose it, you cannot publish updates under `vincom.jyotishguru.app` ever again.**

Back it up to:
- Encrypted cloud storage (Proton Drive, encrypted 1Password vault)
- An offline USB drive
- Do NOT commit to public git

---

## Version management

`versionCode` must be unique and increasing for every upload. Fastlane bumps it automatically before each release. You can check the current value in `app/build.gradle`:
```groovy
versionCode 1
versionName "1.0"
```

`versionName` (the user-visible string) is bumped manually when you want — edit `app/build.gradle` and change `"1.0"` to `"1.1"` etc.

---

## Troubleshooting

**`fastlane` not found**: Use `C:/Ruby33-x64/bin/fastlane.bat` explicitly, or add `C:/Ruby33-x64/bin` to PATH.

**`JAVA_HOME must be set`**: `export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"` before running.

**"Package not found" on upload**: The app listing must exist in Play Console first. See step 2 above.

**"The caller does not have permission"**: The service account needs "Release manager" role on your specific app (not just Developer Account level).
