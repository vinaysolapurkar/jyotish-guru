# Jyotish Guru

Classical Vedic astrology, computed not guessed — available as a web app, Android APK, and Telegram bot.

**Live**: [astro-xi-eight.vercel.app](https://astro-xi-eight.vercel.app)
**Telegram**: [@astrosagepredictionsbot](https://t.me/astrosagepredictionsbot)

## What it does

Every birth chart is computed from the classical Parashari methods — twenty divisional sub-charts, two hundred-plus planetary combinations (yogas), eight timing systems (dashas), Ashtakavarga, Shadbala, Chara Karakas, Arudha Padas, and more. An AI layer (DeepSeek) then explains what the math reveals, grounded in the actual computed chart. No hallucinations. No generic horoscopes.

Users can also add family and loved ones to ask questions about them.

## Architecture

Three layers, clearly separated:

1. **Calculation engine** — `src/lib/astrology.ts` (~1300 lines of pure TypeScript). Julian day math, Lahiri ayanamsa, planetary positions, ascendant, all 20 vargas, 200+ yoga rules, dasha tree, ashtakavarga, chara karakas, arudha padas, special lagnas, planetary aspects.
2. **Interpretive library** — yoga detection rules and classical meanings encoded alongside the calculations.
3. **AI narrative layer** — DeepSeek receives the full computed chart in every system prompt and produces grounded explanations. `src/lib/system-prompt.ts` controls tone and response format.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4, Framer Motion
- **Auth**: NextAuth.js (credentials provider, bcrypt)
- **Database**: Turso (libSQL) via Prisma 5 with the driver adapter
- **AI**: DeepSeek chat completions
- **Geocoding**: OpenStreetMap Nominatim
- **Payments**: UPI (direct, ₹99/month) + PayPal legacy
- **Hosting**: Vercel
- **Mobile**: Capacitor 8 wrapping the web app into a signed Android APK
- **Bot**: Telegram Bot API webhook

## Project layout

```
src/
  app/
    page.tsx              landing page (editorial / parchment aesthetic)
    login/  signup/       credentials auth
    dashboard/            chart, relations, tier controls
    chat/                 conversational UI (DeepSeek-backed)
    admin/                KPIs, recent messages, CSV export (admin-gated)
    privacy/              Play Store privacy policy
    api/
      auth/               NextAuth + signup
      chart/              compute & store
      chat/               DeepSeek with chart context, 5 free/day quota
      geocode/            Nominatim proxy
      messages/           conversation history
      payment/            UPI txn verification + tier upgrade
      relations/          add/delete people in user's life (1 free, infinite paid)
      telegram/           full webhook — onboarding, chart, chat, paywall
      user/               profile + today's message count
      admin/reports/      admin-only aggregates

  components/
    BirthChartSVG.tsx     North Indian diamond chart
    UpgradeModal.tsx      UPI QR + deep link + txn verification
    ...

  lib/
    astrology.ts          the calculation engine
    system-prompt.ts      AI tone and response rules
    prisma.ts             lazy libsql adapter
    auth.ts               NextAuth config

prisma/
  schema.prisma           User, Message, BirthChart, Payment, Relation,
                          GocharaEntry, Client, FamilyMember

android/
  app/                    Capacitor Android project
  fastlane/               Fastfile + Appfile for Play Store uploads
  DEPLOY.md               step-by-step Play Store publishing guide

capacitor.config.ts       points the APK at the deployed site
```

## Setup

```bash
# 1. Clone
git clone https://github.com/vinaysolapurkar/jyotish-guru.git
cd jyotish-guru
npm install

# 2. Environment
cp .env.local.example .env.local
# fill in: DEEPSEEK_API_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN,
#         NEXTAUTH_SECRET, NEXTAUTH_URL, TELEGRAM_BOT_TOKEN, PAYPAL_EMAIL

# 3. Database
npx prisma generate
# Schema is applied to Turso via prisma migrate diff + manual execute
# For a fresh setup, see prisma/schema.prisma

# 4. Dev
npm run dev
```

## Building the Android APK

```bash
# Sync web app into Android project
npx cap sync android

# Build signed release APK + AAB (needs Java 21)
cd android
JAVA_HOME="/path/to/jdk-21" ./gradlew.bat assembleRelease bundleRelease

# Outputs
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

The APK is signed with `android/jyotishguru-release.keystore` (gitignored). Keep that file safe — losing it means you can't publish updates to the Play Store under the same package name.

## Publishing to Play Store (Fastlane)

See [android/DEPLOY.md](android/DEPLOY.md) for the full one-time setup (service account, metadata, screenshots). Once set up:

```bash
cd android
fastlane internal    # push to Internal Testing
fastlane beta        # push to Open Beta
fastlane production  # promote to public
```

## Telegram bot

The bot is at [@astrosagepredictionsbot](https://t.me/astrosagepredictionsbot). The webhook handler lives at `src/app/api/telegram/route.ts` — it runs a conversational onboarding flow (date → time → place), computes the chart, then all messages are full AI chats grounded in that chart. Includes the same ₹99/month UPI paywall as the web.

## Credits

Computational methods based on P.V.R. Narasimha Rao's *Vedic Astrology: An Integrated Approach* — a 515-page canonical treatment of the Parashari school.

## License

All rights reserved.
