// lib/services/paycrestService.ts
import { ApiResponse } from '../../types';

// PayCrest API Types
interface PayCrestOrderRequest {
  amount: string;
  token: string;
  network: string;
  recipient: {
    institution: string;
    accountIdentifier: string;
    accountName: string;
    memo?: string;
  };
  senderFee?: string;
  transactionFee?: string;
  reference?: string;
  returnAddress?: string;
  feeAddress?: string;
}

interface PayCrestOrderResponse {
  id: string;
  amount: string;
  amountPaid: string;
  amountReturned: string;
  token: string;
  senderFee: string;
  transactionFee: string;
  rate: string;
  network: string;
  gatewayId: string;
  reference: string;
  recipient: {
    institution: string;
    accountIdentifier: string;
    accountName: string;
    memo?: string;
  };
  fromAddress: string;
  returnAddress: string;
  receiveAddress: string;
  feeAddress: string;
  createdAt: string;
  updatedAt: string;
  txHash?: string;
  status: 'initiated' | 'crypto_deposited' | 'validated' | 'expired' | 'settled' | 'refunded';
  transactions: Array<{
    id: string;
    gatewayId: string;
    status: string;
    txHash: string;
    createdAt: string;
  }>;
}

interface PayCrestRateRequest {
  amount: string;
  token: string;
  network: string;
  destinationCurrency: string;
}

interface PayCrestRateResponse {
  rate: string;
  fee: string;
  receivableAmount: string;
  expiresAt: string;
}

class PayCrestService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PAYCREST_API_KEY || '';
    this.baseUrl = 'https://api.paycrest.io/v1';
    
    if (!this.apiKey) {
      console.warn('PayCrest API key not found in environment variables');
    }
  }

  // Get exchange rate for USDC to local currency
  async getExchangeRate(
    amount: string,
    token: string = 'USDC',
    network: string = 'base',
    destinationCurrency: string = 'NGN'
  ): Promise<ApiResponse<PayCrestRateResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
        body: JSON.stringify({
          amount,
          token,
          network,
          destinationCurrency
        }),
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to get exchange rate');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get exchange rate: ${(error as Error).message}` 
      };
    }
  }

  // Create off-ramp order (USDC to local bank account)
  async createOffRampOrder(
    amount: string,
    recipientDetails: {
      bankCode: string; // e.g., "GTBINGLA" for GTBank
      accountNumber: string;
      accountName: string;
      memo?: string;
    },
    options?: {
      token?: string;
      network?: string;
      reference?: string;
      returnAddress?: string;
    }
  ): Promise<ApiResponse<PayCrestOrderResponse>> {
    try {
      const orderData: PayCrestOrderRequest = {
        amount,
        token: options?.token || 'USDC',
        network: options?.network || 'base',
        recipient: {
          institution: recipientDetails.bankCode,
          accountIdentifier: recipientDetails.accountNumber,
          accountName: recipientDetails.accountName,
          memo: recipientDetails.memo,
        },
        reference: options?.reference || `PAYSLAB-${Date.now()}`,
        returnAddress: options?.returnAddress,
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to create off-ramp order');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to create off-ramp order: ${(error as Error).message}` 
      };
    }
  }

  // Get order status
  async getOrderStatus(orderId: string): Promise<ApiResponse<PayCrestOrderResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to get order status');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get order status: ${(error as Error).message}` 
      };
    }
  }

  // Get all orders for user
  async getOrders(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<{
    total: number;
    page: number;
    pageSize: number;
    orders: PayCrestOrderResponse[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to get orders');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get orders: ${(error as Error).message}` 
      };
    }
  }

  // Convert USDC to NGN for local operations
  async convertUSDCToNGN(
    amount: string,
    recipientDetails: {
      accountNumber: string;
      accountName: string;
      bankCode?: string;
    },
    returnAddress?: string
  ): Promise<ApiResponse<PayCrestOrderResponse>> {
    return this.createOffRampOrder(
      amount,
      {
        bankCode: recipientDetails.bankCode || 'GTBINGLA', // Default to GTBank
        accountNumber: recipientDetails.accountNumber,
        accountName: recipientDetails.accountName,
        memo: 'PaySlab USDC to NGN conversion',
      },
      {
        returnAddress,
        reference: `CONVERT-${Date.now()}`,
      }
    );
  }

  // Get supported banks and institutions
  async getSupportedInstitutions(): Promise<ApiResponse<Array<{
    code: string;
    name: string;
    country: string;
  }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/institutions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to get supported institutions');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get supported institutions: ${(error as Error).message}` 
      };
    }
  }

  // Validate account details before creating order
  async validateAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<ApiResponse<{
    isValid: boolean;
    accountName?: string;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': this.apiKey,
        },
        body: JSON.stringify({
          accountNumber,
          bankCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`PayCrest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to validate account');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to validate account: ${(error as Error).message}` 
      };
    }
  }
}

export default PayCrestService;