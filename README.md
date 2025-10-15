# PayPortz (payportz-starknet)

Multi-chain payment dashboard built with Next.js + TypeScript. The app uses Bread for on-chain wallet provisioning and balances and Starknet for STRK balances and programmatic account creation. This branch focuses on a Bread-first onboarding flow and programmatic (server-side) Starknet account creation (no injected wallet popups).

## Table of contents

- Features
- Prerequisites
- Environment variables
- Local setup
- Run the app
- Build / Production
- Project structure & important modules
- LocalStorage keys the app uses
- Server endpoints (developer facing)
- Troubleshooting
- Security notes
- Contributing
- License

## Features

- Bread-first onboarding: create multi-chain wallets (EVM, Solana) via Bread and programmatic Starknet account creation on the server.
- Sidebar shows aggregated balance (Bread balances + STRK from Starknet) and reacts to localStorage events.
- Programmatic Starknet account creation endpoint to avoid injected wallet popups.
- Minimal auth: guest account / local account mapping + optional Clerk hooks.

## Prerequisites

- Node.js 18+ (or project's target Node version)
- npm (or pnpm/yarn)
- Optional: Bread public API key for real balances: `NEXT_PUBLIC_BREAD_API_KEY`
- Optional: Server Starknet relayer credentials for funding/deploy flows:
  - `STARKNET_RELAYER_ADDRESS`
  - `STARKNET_RELAYER_PRIVATE_KEY`
  - `STARKNET_RPC_URL`

If the Starknet relayer vars are not set the server endpoints still support non-deploy mode (generate a key/address and return it) but will return graceful ok:false responses for funding/deploy attempts.

## Environment variables (.env.local example)

Create a `.env.local` file in the repository root and add:

```env
NEXT_PUBLIC_BREAD_API_KEY=your_bread_api_key_here
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000/dashboard

# Optional - Starknet relayer for funding/deploy (production only)
STARKNET_RELAYER_ADDRESS=0x...
STARKNET_RELAYER_PRIVATE_KEY=0x...
STARKNET_RPC_URL=https://your-starknet-rpc.example

# Optional/legacy (not required for current branch):
# NEXT_PUBLIC_PRIVY_APP_ID=...
# NEXT_PUBLIC_ALCHEMY_API_KEY=...
```

> Do not commit real secrets into the repository. Use your platform's secret store in production.

## Local setup

Install dependencies:

```bash
npm install
```

## Run the app (development)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. The Signin page is the onboarding flow where you can create a Bread wallet and request a programmatic Starknet account from the server.

## Build / Production

```bash
npm run build
npm run start
```

Adjust environment variables for your hosting environment.

## Project structure & important modules

- `app/` — Next.js app router and components.
  - `app/components/Signin.tsx` — Onboarding & Bread-first sign-in flow. Creates Bread wallet and calls the server to create a Starknet account (non-deploy default). Uses `setAndBroadcast()` to notify other components of localStorage changes.
  - `app/components/core/Sidebar.tsx` — Left navigation and balance card. Fetches Bread balances via `breadApi.getBalances(...)` and STRK via `/api/starknet/balance`. Validates stored Bread wallet id before calling Bread.
  - `app/dashboard/page.tsx` — Dashboard UI (STRK + Bread balances). EVM/Solana/Privy UI removed in this branch to focus on Starknet.
  - `app/lib/breadApi.ts` — Bread API wrapper (createWallet, getBalances, getWallet, etc.). Normalizes create response (maps `wallet_id` → `id`).
  - `app/api/starknet/create-account/route.ts` — Programmatic Starknet account creation endpoint. Supports `{ deploy: false }`.
  - `app/api/starknet/balance/route.ts` — Returns STRK balance for a given Starknet address.
  - `app/providers/providers.tsx` — App providers (QueryClientProvider). PrivyProvider removed in this branch.

## LocalStorage keys the app uses

- `payportz_accounts` — JSON map of saved accounts.
- `payportz_business_name` — saved display name.
- `payportz_bread_wallet_id` — Bread wallet id (24‑hex ObjectId expected).
- `payportz_bread_wallet_evm` — Bread-provided EVM address.
- `payportz_bread_wallet_svm` / `payportz_bread_wallet_solana` — Bread-provided Solana address.
- `payportz_starknet_address` — locally stored Starknet address.
- `payportz_starknet_private_key` — (development only) returned by server in non‑deploy mode.

> In production, do NOT store private keys in localStorage.

## Server endpoints (developer facing)

- `POST /api/starknet/create-account` — Request account generation. Body example: `{ "deploy": false }`. Returns `{ ok: true, accountAddress, privateKey }` in non‑deploy mode. If server SDK or relayer keys missing it returns `{ ok: false, error: "..." }`.
- `POST /api/starknet/balance` — Body: `{ "address": "0x..." }` returns `{ ok: true, balance: "<wei>" }`.

### Quick curl examples

```bash
curl -s -X POST http://localhost:3000/api/starknet/create-account \
  -H 'Content-Type: application/json' \
  -d '{"deploy":false}'

curl -s -X POST http://localhost:3000/api/starknet/balance \
  -H 'Content-Type: application/json' \
  -d '{"address":"0x..."}'
```

## Troubleshooting

- "Invalid ObjectId format" in Sidebar
  - The app expects `payportz_bread_wallet_id` to be a 24‑hex Mongo ObjectId. If you see this error:

```js
// In browser console
localStorage.removeItem('payportz_bread_wallet_id')
window.dispatchEvent(new CustomEvent('localstorage:update', { detail: { key: 'payportz_bread_wallet_id' } }))
```

  - Alternatively, re-create a Bread wallet from the Signin page (Signin clears stale keys before creating a new wallet).

- Starknet create-account returns `ok: false` or no address
  - Ensure server `STARKNET_RELAYER_*` env vars and `STARKNET_RPC_URL` are set if you expect funding/deploy behaviour. Without them the server supports non‑deploy address/key generation only.

- Bread balances don't update after Signin
  - Signin calls `setAndBroadcast()` which dispatches `storage` or `localstorage:update`. Sidebar listens for both. If UI remains stale reload the page or check the console for errors.

## Security notes

- Private keys stored in localStorage are only for development/demo purposes. Use secure custody or encrypted storage for production.
- Never commit `.env.local` with real secrets.

## Contributing

- Follow the TypeScript + React style used in the `app/` directory.
- Use the conventional commit format where possible.
- Add tests and run linters before opening PRs.

## License

Add a `LICENSE` file if you intend to open-source this project.

---

If you'd like, I can also:

- add `CONTRIBUTING.md` with a PR checklist,
- remove Privy from `package.json` and `package-lock.json` and run `npm uninstall` to shrink dependencies,
- add a short `DEMO.md` showing example flows.

Tell me which follow-up you want.
