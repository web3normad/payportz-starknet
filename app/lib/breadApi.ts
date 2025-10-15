// lib/breadApi.ts
const BREAD_API_BASE = 'https://processor-prod.up.railway.app';
const BREAD_API_KEY = process.env.NEXT_PUBLIC_BREAD_API_KEY || '';

export interface BreadWallet {
  id: string;
  reference: string;
  is_active: boolean;
  address: {
    evm: string;
    svm: string;
  };
  transfer: boolean;
  swap: boolean;
  offramp: boolean;
}

export interface OnrampQuote {
  type: 'onramp';
  fee: number;
  expiry: string;
  currency: string;
  rate: number;
  input_amount: number;
  output_amount: number;
}

export interface OfframpQuote {
  type: 'offramp';
  fee: number;
  expiry: string;
  currency: string;
  rate: number;
  input_amount: number;
  output_amount: number;
}

export type Asset = 
  | 'ethereum:usdc' | 'base:usdc' | 'arbitrum:usdc' | 'solana:usdc' 
  | 'bsc:usdc' | 'polygon:usdc' | 'optimism:usdc' | 'avalanche:usdc'
  | 'ethereum:usdt' | 'arbitrum:usdt' | 'solana:usdt' | 'polygon:usdt'
  | 'bsc:usdt' | 'optimism:usdt' | 'avalanche:usdt'
  | 'base:cngn' | 'bsc:cngn';

class BreadApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = BREAD_API_KEY;
    this.baseUrl = BREAD_API_BASE;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-service-key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Wallet Operations
  async createWallet(reference?: string): Promise<BreadWallet> {
    const data = await this.request('/wallet', {
      method: 'POST',
      body: JSON.stringify({
        reference: reference || `wallet_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      }),
    });

    const payload = (data && data.data) || {};
    // API sometimes returns `wallet_id` on create, but other endpoints use `id`.
    // Normalize so callers can always use `id`.
    if (payload.wallet_id && !payload.id) {
      payload.id = payload.wallet_id;
    }
    // Ensure address object exists
    payload.address = payload.address || { evm: "", svm: "" };

    return payload as BreadWallet;
  }

  async getWallet(walletId: string): Promise<BreadWallet> {
    const data = await this.request(`/wallet?wallet_id=${walletId}`);
    return data.data;
  }

  async getWallets(page: number = 1): Promise<{ wallets: BreadWallet[]; total: number; page: number; limit: number }> {
    const data = await this.request(`/wallets?page=${page}`);
    return data.data;
  }

  // Onramp Operations
  async getOnrampQuote(
    amount: number,
    currency: 'NGN',
    asset: Asset,
    isExactOutput: boolean = false
  ): Promise<OnrampQuote> {
    const data = await this.request('/quote/onramp', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
        asset,
        is_exact_output: isExactOutput,
      }),
    });
    return data.data;
  }

  async getOnrampRate(currency: 'NGN'): Promise<{ rate: number }> {
    const data = await this.request(`/rate/onramp?currency=${currency}`);
    return data.data;
  }

  // Offramp Operations
  async getOfframpQuote(
    amount: number,
    currency: 'NGN',
    asset: Asset,
    isExactOutput: boolean = false
  ): Promise<OfframpQuote> {
    const data = await this.request('/quote/offramp', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
        asset,
        is_exact_output: isExactOutput,
      }),
    });
    return data.data;
  }

  async getOfframpRate(currency: 'NGN'): Promise<{ rate: number }> {
    const data = await this.request(`/rate/offramp?currency=${currency}`);
    return data.data;
  }

  async executeOfframp(
    walletId: string,
    amount: number,
    beneficiaryId: string,
    asset: Asset
  ): Promise<{ reference: string }> {
    const data = await this.request('/offramp', {
      method: 'POST',
      body: JSON.stringify({
        wallet_id: walletId,
        amount,
        beneficiary_id: beneficiaryId,
        asset,
      }),
    });
    return data.data;
  }

  async getOfframpStatus(walletId: string, reference?: string) {
    const query = reference ? `wallet_id=${walletId}&reference=${reference}` : `wallet_id=${walletId}`;
    const data = await this.request(`/status/offramp?${query}`);
    return data.data;
  }

  // Transfer Operations
  async transfer(
    walletId: string,
    amount: number,
    receiver: string,
    asset: Asset
  ): Promise<{ hash: string; link: string }> {
    const data = await this.request('/transfer', {
      method: 'POST',
      body: JSON.stringify({
        wallet_id: walletId,
        amount,
        receiver,
        asset,
      }),
    });
    return data.data;
  }

  // Swap Operations
  async swap(
    walletId: string,
    receiver: string,
    fromAsset: Asset,
    toAsset: Asset,
    fromAmount?: number,
    toAmount?: number
  ): Promise<{ hash: string; link: string }> {
    const data = await this.request('/swap', {
      method: 'POST',
      body: JSON.stringify({
        wallet_id: walletId,
        receiver,
        from_asset: fromAsset,
        to_asset: toAsset,
        from_amount: fromAmount,
        to_amount: toAmount,
      }),
    });
    return data.data;
  }

  // Bank Operations
  async getBanks(currency: 'NGN'): Promise<Array<{ name: string; code: string; icon: string }>> {
    const data = await this.request(`/banks?currency=${currency}`);
    return data.data;
  }

  async lookupAccount(
    bankCode: string,
    accountNumber: string,
    currency: 'NGN' = 'NGN'
  ): Promise<{
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
  }> {
    const data = await this.request('/lookup', {
      method: 'POST',
      body: JSON.stringify({
        bank_code: bankCode,
        currency: currency.toLowerCase(),
        account_number: accountNumber,
      }),
    });
    return data.data;
  }

  // Balance Operations
  async getBalance(
    walletId: string,
    asset: Asset
  ): Promise<{
    id: string;
    name: string;
    code: string;
    blockchain: { id: number; name: string };
    balance: number;
    available: number;
    debt: number;
  }> {
    const data = await this.request(`/balance?wallet_id=${walletId}&asset=${asset}`);
    return data.data;
  }

  async getBalances(
    walletId: string
  ): Promise<Array<{
    id: string;
    name: string;
    code: string;
    blockchain: { id: number; name: string };
    balance: number;
    available: number;
    debt: number;
  }>> {
    const data = await this.request(`/balances?wallet_id=${walletId}`);
    return data.data;
  }

  // Automation
  async setAutomation(
    walletId: string,
    options: {
      transfer?: boolean;
      swap?: boolean;
      offramp?: boolean;
      beneficiaryId?: string;
    }
  ) {
    const data = await this.request('/automate', {
      method: 'POST',
      body: JSON.stringify({
        wallet_id: walletId,
        transfer: options.transfer || false,
        swap: options.swap || false,
        offramp: options.offramp || false,
        beneficiary_id: options.beneficiaryId,
      }),
    });
    return data.data;
  }
}

export const breadApi = new BreadApiService();