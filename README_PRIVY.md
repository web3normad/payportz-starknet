Privy integration (dev guide)

This project can optionally integrate with Privy (https://privy.io) to provide email-based sign-in and key management for EVM and Starknet.

Quick install

1. Install the SDK (choose the package matching your project):

npm install @privy-io/privy

2. Add env variables to `.env.local`:

NEXT_PUBLIC_PRIVY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_RPC_URL=https://eth-goerli.alchemyapi.io/v2/your_key_or_other_rpc
NEXT_PUBLIC_USDC_ADDRESS=0x... # optional; token addresses for your network
NEXT_PUBLIC_USDT_ADDRESS=0x...

3. Restart dev server:

rm -rf .next
npm run dev

How the Signin flow works

- `app/components/Signin.tsx` contains a `handlePrivySignin` helper which dynamically imports the Privy SDK at runtime to avoid build-time errors if the package isn't installed.
- The helper attempts to call `sendMagicLink` or `signIn` depending on SDK methods available. Adapt as needed for the SDK version you use.

Security notes

- Privy contains features to manage encryption keys and secret material. Follow Privy's documentation for production key management.
- The project currently stores a demo private key in `localStorage.payportz_evm_private_key`. For production flows, migrate to a secure signer (WalletConnect, Privy-managed keys, or server-side custody).

If you want, I can:

- Wire the Privy sign-in button into the Signin UI and route a successful sign-in to create on-chain wallets.
- Implement server-side token exchange or store keys in Privy KMS instead of localStorage.
