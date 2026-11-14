# Linkloom — Android app (React Native + Expo)

Linkloom's React Native app for creator and brand collaboration, based on the supplied mobile UI references.
The app connects to the Linkloom API for authentication, profiles, creator discovery, campaigns, bids, shortlists, orders, and notifications. Some features remain demo/local-only where the API contract does not provide endpoints.

## Run locally
1. Install a Node.js version supported by Expo SDK 58 (22.13+ on the 22.x line or 24.3+ on the 24.x line; https://nodejs.org).
2. On your Android phone install **Expo Go** from the Play Store. This project targets Expo SDK 58, so Expo Go must support SDK 58.
3. In this folder:
   ```
   npm install
   npx expo install --check
   npx expo start --go
   ```
4. Scan the QR code with Expo Go (phone + computer on the same Wi-Fi).
   - Different networks / firewall: `npx expo start --tunnel --go`
   - Android emulator instead: `npx expo start --android --go`

`expo install --check` verifies that native package versions match this project's Expo SDK; it does not upgrade the project to match a different Expo Go release.
Email/password signup and login can be tested in Expo Go. Signup sends a verification code to the supplied email; Google sign-in requires a development build.

## Try these flows
- Welcome slides -> choose Creator or Brand -> sign up with email/password or log in with email/password
- Brand or creator -> complete the role-specific signup/profile setup after email verification
- Brand -> discover creators, create campaigns, review bids, manage shortlists, and review orders
- Creator -> browse campaigns, submit bids, and review proposals and orders
- Logged-out creator profile -> Log In -> choose Brand -> returns to that creator
- Home -> browse creators first, then learn how Linkloom helps run campaigns
- Center + -> open the campaign brief over Jobs; cancel to return to Jobs
- Dashboard -> campaign metrics, job bids, and campaign management
- Jobs -> Review bids -> Select (hires + escrow)
- Orders -> open an order -> Approve & pay
- Account -> Lists, Deliverables, Reporting, Messages, Upgrade/Help, and Log Out

## Structure
- `src/theme.ts` shared Emerald + Mint colors and typography; the app follows the device light/dark setting
- `src/data.ts` demo data - `src/store.tsx` app state
- `src/components/ui.tsx` shared components - `src/navigation.tsx` tabs + stack
- `src/screens/` Public (landing/auth/onboarding), Dashboard (tabs), Workspace, Sheets (popups)

## Backend configuration and limitations
- Configure the API host with `EXPO_PUBLIC_API_URL`; the default is `https://collab-api-ewju.onrender.com`. `VITE_API_URL` is not read by this Expo app.
- Signup requests an email verification code through `/v1/auth/otp/request/`; verification returns the session, then signup completion sends the role-specific details and password. Login uses email and password.
- Google sign-in sends a Google ID token to `/v1/auth/google/`. It requires an Android OAuth client for package `com.brandside.app` and the build certificate SHA-1, a Web OAuth client ID, and an Expo development build; it does not work in Expo Go.
- The client stores access and refresh tokens with Expo SecureStore, refreshes access tokens, reads the `{ success, data, error, meta }` envelope, and converts rupees to/from paise at API boundaries.
- Campaign requests send lowercase platform codes (for example `instagram`) and structured `usageRights` with `duration`, `channels`, `exclusivity`, `exclusivityCategory`, and `territory`; the campaign form collects these separately instead of sending a free-text string.
- Profile photos can be selected locally, but the supplied contract has no upload endpoint or writable avatar field. The selected image will not be available on other devices or after reinstall.
- Conversations and the brand-first messaging restriction are currently app-local. The contract has no conversation/message endpoints, so messages are not delivered or persisted on the server.
- Campaign creation only sends documented fields. City/category/language campaign fields and campaign-filter query parameters are absent from the supplied contract, so those filters cannot be guaranteed to work against server data.
- Package management, cart, checkout-session creation, payment verification, payout/withdrawal, and analytics/export endpoints are available. The app does not yet present the returned Razorpay session in a payment UI, so checkout cannot be completed in-app; reporting is limited to the documented order data.
- Creator date of birth, gender, languages, and platform handles are not writable through the documented creator profile endpoint. Do not treat those local form fields as server-persisted.
- Aadhaar/PAN and full identity verification are not collected.
