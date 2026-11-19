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
   npm start
   ```
4. Scan the QR code with Expo Go (phone + computer on the same Wi-Fi).
   - Different networks / firewall: `npm run tunnel`
   - Google sign-in: build and open the native development app with `npm run android`, then start Metro with `npm run tunnel:dev`.
   - Android emulator instead: `npx expo start --android --go`

`expo install --check` verifies that native package versions match this project's Expo SDK; it does not upgrade the project to match a different Expo Go release.
The `start` and `tunnel` scripts explicitly launch Expo Go, even though this project also includes a development client. Email/password signup and login can be tested in Expo Go. Signup sends a verification code to the supplied email. Google sign-in uses native code and requires the Linkloom development build; it cannot run in Expo Go.

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
- For an installed iOS build, set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` to the iOS OAuth client ID and `GOOGLE_IOS_URL_SCHEME` to its reversed client ID (`com.googleusercontent.apps.…`) before building. The latter adds the native Google sign-in callback scheme through `app.config.js`. Register the iOS bundle ID `com.brandside.app` with Google. Rebuild the app after changing either value. Email signup and password login do not need these Google settings.
- The client stores access and refresh tokens with Expo SecureStore, refreshes access tokens, reads the `{ success, data, error, meta }` envelope, and converts rupees to/from paise at API boundaries.
- Campaign requests send lowercase platform codes (for example `instagram`) and structured `usageRights` with `duration`, `channels`, `exclusivity`, `exclusivityCategory`, and `territory`; the campaign form collects these separately instead of sending a free-text string.
- Creator profile photos are uploaded through `/v1/creators/me/avatar/` when the profile is saved. Confirm this against the deployed API before release.
- Conversations and messages use `/v1/conversations/` endpoints. Confirm delivery and the brand-first restriction against the deployed API before release.
- Campaign creation only sends documented fields. City/category/language campaign fields and campaign-filter query parameters are absent from the supplied contract, so those filters cannot be guaranteed to work against server data.
- Package management, cart, checkout-session creation, payment verification, payout/withdrawal, and analytics/export endpoints are available. The app does not yet present the returned Razorpay session in a payment UI, so checkout cannot be completed in-app; reporting is limited to the documented order data.
- Creator date of birth, gender, languages, and platform handles are not writable through the documented creator profile endpoint. Do not treat those local form fields as server-persisted.
- KYC uses `/v1/kyc/` to save PAN, government-ID, and bank steps, uploads the selected document through the signed `/v1/uploads/` flow, and submits the completed KYC for Ops review. Campaign publishing, offers, creator bids, and checkout require `verified` status; KYC fields lock while `pending` or `verified`, and `rejected` users can edit and resubmit.
- KYC status is refreshed on sign-in, when the KYC form opens, and when the app returns to the foreground. This project has no WebSocket connection configured; wire `kyc_verified` / `kyc_rejected` events when the backend provides its socket URL and subscription protocol.
