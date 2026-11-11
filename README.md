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
   npx expo start
   ```
4. Scan the QR code with Expo Go (phone + computer on the same Wi-Fi).
   - Different networks / firewall: `npx expo start --tunnel`
   - Android emulator instead: `npx expo start --android`

`expo install --check` verifies that native package versions match this project's Expo SDK; it does not upgrade the project to match a different Expo Go release.

## Try these flows
- Welcome slides -> choose Creator or Brand -> sign up or log in -> choose email or mobile -> verify with an OTP
- Brand or creator -> choose mobile or email -> enter the contact detail -> verify the channel-specific OTP -> complete role-specific signup/profile setup
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
- Authentication requests send `{ channel, destination }` to `/v1/auth/otp/request/`; OTP verification returns the session, and signup completion sends the role-specific details. The server must support both `sms` and `email` channels for passwordless login/signup.
- The client stores access and refresh tokens with Expo SecureStore, refreshes access tokens, reads the `{ success, data, error, meta }` envelope, and converts rupees to/from paise at API boundaries.
- Campaign requests send lowercase platform codes (for example `instagram`) and structured `usageRights` with `duration`, `channels`, `exclusivity`, `exclusivityCategory`, and `territory`; the campaign form collects these separately instead of sending a free-text string.
- Profile photos can be selected locally, but the supplied contract has no upload endpoint or writable avatar field. The selected image will not be available on other devices or after reinstall.
- Conversations and the brand-first messaging restriction are currently app-local. The contract has no conversation/message endpoints, so messages are not delivered or persisted on the server.
- Campaign creation only sends documented fields. City/category/language campaign fields and campaign-filter query parameters are absent from the supplied contract, so those filters cannot be guaranteed to work against server data.
- Package management, cart, and checkout are wired to the supplied endpoints. The contract still lacks payment initiation/confirmation details, payout/withdrawal, and analytics/export APIs, so checkout cannot be considered a completed payment flow and reporting is limited to order data.
- Creator date of birth, gender, languages, and platform handles are not writable through the documented creator profile endpoint. Do not treat those local form fields as server-persisted.
- Aadhaar/PAN and full identity verification are not collected.
