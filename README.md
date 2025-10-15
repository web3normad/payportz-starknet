# PayPortz
<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1.3-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Starknet-1A1A40?style=for-the-badge&logo=ethereum&logoColor=white" alt="Starknet" />
  <img src="https://img.shields.io/badge/USDC-2775CA?style=for-the-badge&logo=ethereum&logoColor=white" alt="USDC" />
</div>

PayPortz helps Nigerian businesses move money and complete international trade faster, cheaper, and with far less risk.

This repository is an early-stage prototype for PayPortz — a product that gives traders instant access to USD liquidity, protects payments with programmable escrow, and builds verifiable trade history so businesses can grow and qualify for finance.

Why PayPortz exists

Many Nigerian traders cannot access USD through regular banks. That forces them to use informal, risky channels that charge huge premiums and offer no protection when goods don’t arrive. PayPortz brings a safer, faster alternative that:

- Converts NGN to USD-stablecoins quickly and at transparent rates (minutes, not months).
- Holds payments in escrow and releases them only when verified trade milestones are met.
- Creates an auditable transaction history that helps businesses access credit and trade more confidently.

Who this is for

- Nigerian importers and exporters who need reliable USD liquidity for international trade.
- Small and medium enterprises that want clear transaction history and merchant tools to grow.
- International buyers who need verifiable quality checks and transparent payments.

What PayPortz does (plain language)

- Fast conversion: Convert NGN to USDC at fair rates so suppliers can be paid promptly.
- Protected payments: Money is held in a smart escrow and released in stages (order, shipment, delivery) only after evidence of each milestone.
- Quality guarantees: Inspections and certificates ensure exporters get fair prices for verified quality.
- Trade records & analytics: Businesses get a clear ledger and reports that make it easier to apply for trade finance.

Key benefits

- Dramatically lower cost vs informal dollar markets.
- Much faster access to USD liquidity for time-sensitive purchases.
- Less fraud and easier dispute resolution through evidence-backed payment releases.
- Better ability to qualify for loans with a business-grade transaction history.

High-level features

- NGN → USDC conversion with competitive fees
- Smart escrow with milestone-based release (order, shipment, delivery)
- Inspection-backed payments for agricultural and commodity exports
- Shipping integrations for automatic delivery verification
- Supplier reputation and dispute tools

A note about this repository

This project demonstrates product flows and integrations for PayPortz. It is intended as a prototype and developer demo. It contains convenience features for local development (for example, some keys may be stored locally in non-production flows). Do not treat this as a production custody or compliance-ready system without additional security, audits, and legal/regulatory work.

Tech stack (high level)

- Web: Next.js (App Router), React, TypeScript
- Styling: Tailwind CSS
- Wallet & onboarding: Bread (wallet provisioning and balance lookups)
- Blockchain: Starknet (STRK flows) and support for stablecoin rails (e.g., USDC on supported chains)
- Server: Next.js API routes (Node.js)
- Integrations: Circle (USDC), DHL/FedEx tracking APIs, inspection partners (SGS/Bureau Veritas)
- Storage & evidence: IPFS (for inspection reports / dispute evidence)
- Smart contracts: Upgradeable escrow and Letter-of-Credit contracts

Try it locally (developer demo)

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000` and use the Signin page to create a demo wallet and try the onboarding flow.

If you need the developer-focused setup (env vars, relayer keys, deployment notes), say the word and I’ll add a `DEVELOPER.md` with step-by-step instructions.

Want help with next steps?

I can:

- Add a short product one-pager or investor pitch based on this repo.
- Create `DEVELOPER.md` with environment variables and relayer setup.
- Remove demo-only dependencies and prepare a production checklist.

Tell me which you'd like and I’ll implement it.
