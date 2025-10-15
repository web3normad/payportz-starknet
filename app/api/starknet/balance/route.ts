import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const address = body?.address;
    const token = body?.token || process.env.STARKNET_STRK_TOKEN_ADDRESS || '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    const RPC_URL = process.env.STARKNET_RPC_URL || process.env.STARKNET_NODE_URL || '';

    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

    let starknetPkg: any = null;
    try {
      starknetPkg = await import('starknet').catch(() => null);
    } catch (e) {
      starknetPkg = null;
    }

    if (!starknetPkg) {
      return NextResponse.json({ ok: false, error: 'Server missing Starknet SDK (starknet). Install it in server dependencies.', balance: '0' }, { status: 200 });
    }

    try {
      const { RpcProvider, Contract, CallData } = starknetPkg as any;
      const provider = new RpcProvider({ nodeUrl: RPC_URL || 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8' });

      // Try to use standard token contract ABI helpers
      let balance = 0n;
      try {
        const contract = new Contract(token, provider as any);
        // many token ABIs expose getBalance or balanceOf
        if (typeof contract.getBalance === 'function') {
          const resp = await contract.getBalance(address);
          if (Array.isArray(resp) && resp.length) balance = BigInt(resp[0]);
          else balance = BigInt(resp || 0);
        } else {
          const resp = await provider.callContract({ contractAddress: token, entrypoint: 'balanceOf', calldata: [address] });
          if (Array.isArray(resp) && resp.length) balance = BigInt(resp[0]);
        }
      } catch (e) {
        try {
          const resp = await provider.callContract({ contractAddress: token, entrypoint: 'balanceOf', calldata: [address] });
          if (Array.isArray(resp) && resp.length) balance = BigInt(resp[0]);
        } catch (err) {
          console.error('Balance read failed', err);
        }
      }

  return NextResponse.json({ ok: true, address, token, balance: balance.toString() });
    } catch (e: any) {
      console.error('Unexpected server error fetching Starknet balance', e);
      return NextResponse.json({ error: e?.message || 'Unexpected server error' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Bad request to /api/starknet/balance:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
