
import type { NextRequest } from "next/server";


import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const chain = body.chain || process.env.ALCHEMY_CHAIN || 'arbitrumSepolia';
  const email = body.email || body.emailAddress || body.emailAddressRaw || (`guest@payportz.local`);

  // Ensure env present
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const ACCESS_KEY = process.env.ACCESS_KEY;
  const ALCHEMY_POLICY_ID = process.env.ALCHEMY_POLICY_ID;

  if (!ALCHEMY_API_KEY || !ACCESS_KEY) {
    return NextResponse.json({ error: 'Missing ALCHEMY_API_KEY or ACCESS_KEY in server env' }, { status: 500 });
  }

  try {
    // First: call Alchemy Signer signup endpoint to create a per-user signer (owner EOA)
    // This endpoint returns an address (owner signer) that can be used as the owner for a smart account.
    const signupRes = await fetch('https://api.g.alchemy.com/signer/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ALCHEMY_API_KEY}`,
      },
      body: JSON.stringify({ email }),
    });

    let signerAddress: string | null = null;
    let signupJson: any = null;
    if (signupRes.ok) {
      // Try dynamic import of Account Kit SDKs. If they're not installed, fall back
      // to calling the Alchemy Signer REST API for signup which returns a signer EOA.
      const signerModule = await import("@account-kit/signer").catch(() => null);
      const infraModule = await import("@account-kit/infra").catch(() => null);
      const clientModule = await import("@account-kit/wallet-client").catch(() => null);

      // If Account Kit SDKs are available, prefer the richer client flow.
      if (signerModule && infraModule && clientModule) {
        const { createServerSigner } = signerModule;
        const { alchemy, arbitrumSepolia, baseGoerli, baseMainnet } = infraModule;
        const { createSmartWalletClient } = clientModule;

        // choose chain constant - prefer baseGoerli if available and user asked base
        let chainConst: any = arbitrumSepolia;
        if (chain.toLowerCase().includes("base")) {
          chainConst = baseGoerli || arbitrumSepolia;
        }

        const signer = await createServerSigner({
          auth: { accessKey: ACCESS_KEY },
          connection: { apiKey: ALCHEMY_API_KEY },
        });

        const transport = alchemy({ apiKey: ALCHEMY_API_KEY });
        const client = createSmartWalletClient({ transport, chain: chainConst, signer });

        // request counterfactual account address
        const account = await client.requestAccount();
        const address = account.address;

        // prepare minimal sponsored deploy call (if policy id present)
        let txResult: any = null;
        if (ALCHEMY_POLICY_ID) {
          const prepared = await client.prepareCalls({
            from: address,
            calls: [{ to: "0x0000000000000000000000000000000000000000", data: "0x", value: "0x0" }],
            capabilities: { paymasterService: { policyId: ALCHEMY_POLICY_ID } },
          });
          const signed = await client.signPreparedCalls(prepared);
          const sent = await client.sendPreparedCalls(signed);
          const txHash = await client.waitForCallsStatus({ id: sent.preparedCallIds[0] });
          txResult = { preparedIds: sent.preparedCallIds, txHash };
        }

        return NextResponse.json({ ok: true, address, signerAddress: account.owner || undefined, txResult });
      }

      // Fallback: use Alchemy Signer REST API to create a signer (owner) for this email
      // This does not require the Account Kit packages to be installed.
      const email = (body && body.email) || `guest+${Date.now()}@example.com`;
      const signupRes = await fetch("https://api.g.alchemy.com/signer/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ALCHEMY_API_KEY}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!signupRes.ok) {
        const text = await signupRes.text().catch(() => "failed to call Alchemy Signer signup");
        return NextResponse.json({ error: `Signer signup failed: ${text}` }, { status: 500 });
      }

      const signupData = await signupRes.json().catch(() => ({}));
      const signerAddress = signupData.address || signupData.owner || null;

      // Attempt to predict smart account address if smart-contracts helper is installed
      let smartAccountAddress: string | null = null;
      try {
        const contracts = await import("@account-kit/smart-contracts").catch(() => null);
        if (contracts && signerAddress) {
          const { predictModularAccountV2Address } = contracts;
          // Default factory/implementation addresses are chain-dependent; leave salt 0
          // NOTE: In production you should supply the correct factory & implementation
          const factoryAddress = process.env.AK_MAV2_FACTORY || "0x00000000000017c61b5bEe81050EC8eFc9c6fecd";
          const implementationAddress = process.env.AK_MAV2_IMPL || "0x000000000000c5A9089039570Dd36455b5C07383";
          // @ts-ignore - BigInt literal
          const predicted = predictModularAccountV2Address({
            factoryAddress,
            implementationAddress,
            salt: 0n,
            type: "SMA",
            ownerAddress: signerAddress,
          });
          smartAccountAddress = predicted?.toString?.() || String(predicted);
        }
      } catch (e) {
        // ignore - optional helper not available
        console.warn("smart-contracts predict not available", e);
      }

      return NextResponse.json({ ok: true, address: signerAddress, signerAddress, smartAccountAddress });
      // try to compute the ModularAccountV2 address deterministically. This requires factory & implementation addresses.
      if (smartContractsModule && signerAddress) {
        try {
          const { predictModularAccountV2Address } = smartContractsModule;
          // read factory/implementation addresses from env when available
          const mav2FactoryAddress = process.env.ALCHEMY_MAV2_FACTORY || process.env.MAV2_FACTORY_ADDRESS || '';
          const implementationAddress = process.env.ALCHEMY_MAV2_IMPL || process.env.MAV2_IMPLEMENTATION_ADDRESS || '';

          if (mav2FactoryAddress && implementationAddress) {
            // default salt 0n and type 'SMA' mirrors Alchemy's examples
            // @ts-ignore: predictModularAccountV2Address may expect bigint salt; coerce safely
            const predicted = predictModularAccountV2Address({
                factoryAddress: mav2FactoryAddress,
                implementationAddress,
                // avoid BigInt literal to satisfy older TS targets
                // @ts-ignore
                salt: BigInt(0),
                type: 'SMA',
                ownerAddress: signerAddress,
              });
            smartAccountAddress = predicted;
          } else {
            // smart-contracts present but no factory/impl env — skip deterministic prediction
            console.warn('MAV2 factory/implementation env vars not set; skipping deterministic predict');
          }
        } catch (err: any) {
          console.warn('predictModularAccountV2Address error', err);
        }
      }

      // If there's a paymaster policy id configured, optionally prepare a minimal sponsored call
      if (ALCHEMY_POLICY_ID && accountAddress) {
        try {
          const prepared = await client.prepareCalls({
            from: accountAddress,
            calls: [{ to: '0x0000000000000000000000000000000000000000', data: '0x', value: '0x0' }],
            capabilities: { paymasterService: { policyId: ALCHEMY_POLICY_ID } },
          });
          const signed = await client.signPreparedCalls(prepared);
          const sent = await client.sendPreparedCalls(signed);
          const txHash = await client.waitForCallsStatus({ id: sent.preparedCallIds[0] });
          txResult = { preparedIds: sent.preparedCallIds, txHash };
        } catch (err: any) {
          console.warn('sponsored deploy preparation failed', err);
        }
      }
    }

    // final response: include signerAddress (if created), a predicted smart account address (if computed),
    // and an account address from the client.requestAccount() fallback.
    return NextResponse.json({ ok: true, signerAddress, smartAccountAddress, address: accountAddress, txResult });
  } catch (err: any) {
    console.error('alchemy provision error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
