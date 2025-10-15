import { NextResponse } from 'next/server';

/**
 * Server endpoint to programmatically create and deploy a Starknet account.
 * This endpoint:
 * 1. Generates a new private/public key pair
 * 2. Calculates the account address
 * 3. Funds the account with STRK from a relayer wallet
 * 4. Deploys the account contract
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const opts = body || {};

    // Server configuration from environment variables
      const RELAYER_ADDRESS = process.env.STARKNET_RELAYER_ADDRESS;
      const RELAYER_PK = process.env.STARKNET_RELAYER_PRIVATE_KEY;
    const RPC_URL = process.env.STARKNET_RPC_URL || process.env.STARKNET_NODE_URL || process.env.MY_NODE_URL || 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8';
    const STRK_TOKEN_ADDRESS = process.env.STARKNET_STRK_TOKEN_ADDRESS || '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
    
    // OpenZeppelin account class hash (v0.17.0) - standard for Starknet accounts
    const OZ_ACCOUNT_CLASS_HASH = opts.classHash || '0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688';
    
    // Default funding amount: 100 STRK (in wei)
    const FUNDING_AMOUNT = opts.fundingAmount || '100000000000000000000';

    // Import Starknet SDK
    let starknetPkg: any = null;
    try {
      starknetPkg = await import('starknet').catch(() => null);
    } catch (e) {
      starknetPkg = null;
    }

    if (!starknetPkg) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Server missing Starknet SDK. Install with: npm install starknet' 
      }, { status: 200 });
    }

    const { RpcProvider, Account, ec, CallData, hash, stark } = starknetPkg as any;

    console.log('🚀 Starting Starknet account creation...');

    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    console.log('✅ Connected to Starknet:', RPC_URL);

    // Generate new private key or use provided one
    const privateKey = opts.customPrivateKey || stark.randomAddress?.() || stark.random?.() || `0x${Math.floor(Math.random() * 1e16).toString(16).padStart(64, '0')}`;
    console.log('🔑 Generated private key');

    // Derive public key from private key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    console.log('🔑 Generated public key:', publicKey);

    // Prepare constructor calldata for OpenZeppelin account
    const constructorCallData = CallData.compile({ publicKey });

    // Calculate the future address of the account (deterministic)
    const precomputedAddress = hash.calculateContractAddressFromHash(
      publicKey,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCallData,
      0
    );
    console.log('📍 Precomputed account address:', precomputedAddress);

    // Determine whether to deploy/fund or only create keys/address
    const doDeploy = opts.deploy === undefined ? true : Boolean(opts.deploy);
    const relayerConfigured = !!(RELAYER_ADDRESS && RELAYER_PK);

    // If caller asked to skip deploy, return the generated address and key immediately
    if (!doDeploy) {
      return NextResponse.json({
        ok: true,
        deploy: false,
        accountAddress: precomputedAddress,
        account_address: precomputedAddress,
        privateKey,
        private_key: privateKey,
        publicKey,
        public_key: publicKey,
        message: 'Account keys and precomputed address created; deploy skipped by request.'
      });
    }

    // If deploy is requested but relayer isn't configured, return info and ask for manual funding
    if (!relayerConfigured) {
      return NextResponse.json({
        ok: false,
        error: 'Relayer not configured. Cannot fund/deploy account. Provide STARKNET_RELAYER_ADDRESS and STARKNET_RELAYER_PRIVATE_KEY to enable funding/deploy.',
        requiresManualFunding: true,
        accountAddress: precomputedAddress,
        account_address: precomputedAddress,
        privateKey,
        private_key: privateKey,
      }, { status: 200 });
    }

    // Create relayer account instance for funding
    let relayerAccount: any = null;
    try {
      relayerAccount = new Account(provider, RELAYER_ADDRESS, RELAYER_PK);
    } catch (e) {
      try {
        relayerAccount = new Account(provider, { address: RELAYER_ADDRESS, privateKey: RELAYER_PK });
      } catch (e2) {
        console.error('Failed to create relayer account:', e, e2);
        return NextResponse.json({ 
          ok: false, 
          error: 'Failed to instantiate relayer account. Check credentials.' 
        }, { status: 200 });
      }
    }

    if (!relayerAccount) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to create relayer account instance.' 
      }, { status: 200 });
    }

    console.log('👤 Relayer account created');

    // Fund the new account with STRK tokens
    console.log('💸 Funding new account with STRK...');
    const transferCall = {
      contractAddress: STRK_TOKEN_ADDRESS,
      entrypoint: 'transfer',
      calldata: CallData.compile([precomputedAddress, FUNDING_AMOUNT, '0x0']),
    };

    let fundingTxHash = '';
    try {
      const { transaction_hash } = await relayerAccount.execute(transferCall);
      fundingTxHash = transaction_hash;
      console.log('📝 Funding transaction hash:', fundingTxHash);

      // Wait for funding to be confirmed
      console.log('⏳ Waiting for funding confirmation...');
      const receipt = await provider.waitForTransaction(fundingTxHash);
      
      if (receipt.status !== 'ACCEPTED_ON_L2' && receipt.status !== 'ACCEPTED_ON_L1') {
        console.warn('⚠️ Funding transaction not confirmed:', receipt.status);
      } else {
        console.log('✅ Funding confirmed');
      }
    } catch (error: any) {
      console.error('❌ Funding failed:', error.message);
      return NextResponse.json({ 
        ok: false, 
        error: `Funding failed: ${error.message}`,
        accountAddress: precomputedAddress,
        privateKey,
        publicKey,
      }, { status: 200 });
    }

    // Deploy the account contract
    console.log('🚀 Deploying account contract...');
    const newAccount = new Account(provider, precomputedAddress, privateKey);

    const deployPayload = {
      classHash: OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata: constructorCallData,
      contractAddress: precomputedAddress,
      addressSalt: publicKey,
    };

    let deploymentTxHash = '';
    try {
      // Add a small delay to ensure funding is fully processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      const deployResult = await newAccount.deployAccount(deployPayload);
      deploymentTxHash = deployResult?.transaction_hash || '';
      
      console.log('📝 Deployment transaction hash:', deploymentTxHash);

      if (deploymentTxHash) {
        console.log('⏳ Waiting for deployment confirmation...');
        await provider.waitForTransaction(deploymentTxHash);
        console.log('✅ Account deployed successfully');
      }
    } catch (error: any) {
      console.error('⚠️ Deployment error (account may still be usable):', error.message);
      // Don't fail completely - the account is funded and can be deployed later
    }

    // Success response
    return NextResponse.json({ 
      ok: true, 
      success: true,
      accountAddress: precomputedAddress,
      account_address: precomputedAddress, // alias for compatibility
      privateKey,
      private_key: privateKey, // alias
      publicKey,
      public_key: publicKey, // alias
      fundingTxHash,
      funding_tx_hash: fundingTxHash, // alias
      deploymentTxHash,
      deployment_tx_hash: deploymentTxHash, // alias
      message: 'Starknet account created successfully',
      network: RPC_URL.includes('mainnet') ? 'mainnet' : 'sepolia',
    });

  } catch (err: any) {
    console.error('❌ Unexpected error creating Starknet account:', err);
    return NextResponse.json({ 
      ok: false,
      error: err?.message || 'Unexpected server error',
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    }, { status: 500 });
  }
}