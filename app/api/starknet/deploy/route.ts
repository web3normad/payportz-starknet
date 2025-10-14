import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = body?.deployPayload;

    if (!payload) {
      return NextResponse.json({ error: 'Missing deployPayload' }, { status: 400 });
    }

    // Ensure required relayer env vars exist
    const RELAYER_ADDRESS = process.env.STARKNET_RELAYER_ADDRESS;
    const RELAYER_PK = process.env.STARKNET_RELAYER_PRIVATE_KEY;
    const RPC_URL = process.env.STARKNET_RPC_URL || '';

    if (!RELAYER_ADDRESS || !RELAYER_PK) {
      return NextResponse.json({ error: 'Relayer not configured on server. Set STARKNET_RELAYER_ADDRESS and STARKNET_RELAYER_PRIVATE_KEY.' }, { status: 500 });
    }

    // Dynamically import starknet libraries. If not installed, return informative error.
    let starknetPkg: any = null;
    try {
      // prefer server-side 'starknet' package
      starknetPkg = await import('starknet').catch(() => null);
    } catch (e) {
      starknetPkg = null;
    }

    if (!starknetPkg) {
      return NextResponse.json({ error: 'Server missing Starknet SDK. Install a compatible SDK (e.g. starknet) in server dependencies.' }, { status: 500 });
    }

    // This code attempts to use the most common server-side Account/Provider API shapes.
    try {
      const { RpcProvider, Account, ec, number } = starknetPkg as any;

      const provider = new RpcProvider({ nodeUrl: RPC_URL || 'https://alpha4.starknet.io' });

      // Create relayer account from private key
      const relayerAddress = RELAYER_ADDRESS;
      const relayerPk = RELAYER_PK;

      // Account constructors differ; try a few shapes
      let relayerAccount: any = null;
      try {
        relayerAccount = new Account(provider, relayerAddress, relayerPk);
      } catch (e) {
        // try alternative shape: { address, privateKey }
        try {
          relayerAccount = new Account(provider, { address: relayerAddress, privateKey: relayerPk });
        } catch (e2) {
          // give up
          console.error('Failed to create relayer account with provided Account API shapes', e, e2);
        }
      }

      if (!relayerAccount) {
        return NextResponse.json({ error: 'Failed to instantiate relayer account with server SDK. See server logs.' }, { status: 500 });
      }

  // Prepare deploy details expected by the SDK
  const deployPayload = payload as any;

      // Estimate fee (best effort)
      let fees: any = null;
      try {
        if (typeof relayerAccount.estimateAccountDeployFee === 'function') {
          fees = await relayerAccount.estimateAccountDeployFee(deployPayload, { version: '0x03' });
        }
      } catch (e) {
        console.warn('Fee estimation failed:', e);
      }

      const deployDetails: any = {};
      if (fees?.suggestedMaxFee) deployDetails.maxFee = fees.suggestedMaxFee;
      if (fees?.resourceBounds) deployDetails.resourceBounds = fees.resourceBounds;
      if (!deployDetails.version) deployDetails.version = '0x03';

      // Deploy
      let tx: any = null;
      try {
        if (typeof relayerAccount.deployContract === 'function') {
          tx = await relayerAccount.deployContract({
            unique: false,
            classHash: deployPayload.classHash,
            constructorCalldata: deployPayload.constructorCalldata,
            salt: deployPayload.addressSalt,
          }, deployDetails);
        } else if (typeof relayerAccount.invoke === 'function') {
          // fallback: some SDKs require different call
          tx = await relayerAccount.invoke(deployPayload, deployDetails);
        } else {
          return NextResponse.json({ error: 'Relayer Account does not support deployContract or invoke.' }, { status: 500 });
        }
      } catch (e) {
        console.error('Deployment failed:', e);
        return NextResponse.json({ error: 'Deployment execution failed. See server logs.' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, tx, contractAddress: deployPayload.contractAddress || null });
    } catch (e: any) {
      console.error('Unexpected server error during Starknet deploy', e);
      return NextResponse.json({ error: 'Unexpected server error. See logs.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Bad request to /api/starknet/deploy:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
