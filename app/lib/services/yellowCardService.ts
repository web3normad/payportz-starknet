// lib/services/yellowCardService.ts
import { ApiResponse } from '../../types';

// Yellow Card API Types
interface YellowCardBuyRequest {
  amount: number;
  currency: string; // 'NGN'
  crypto: string; // 'USDC'
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'card';
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
  };
  walletAddress: string; // User's USDC wallet address
  callbackUrl?: string;
  metadata?: any;
}

interface YellowCardBuyResponse {
  id: string;
  amount: number;
  cryptoAmount: number;
  currency: string;
  crypto: string;
  exchangeRate: number;
  fee: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    reference: string;
    expiresAt: string;
  };
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface YellowCardRateRequest {
  amount: number;
  fromCurrency: string; // 'NGN'
  toCrypto: string; // 'USDC'
}

interface YellowCardRateResponse {
  rate: number;
  cryptoAmount: number;
  fee: number;
  totalAmount: number;
  expiresAt: string;
}

class YellowCardService {
  private apiKey: string;
  private baseUrl: string;
  private environment: 'sandbox' | 'production';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YELLOW_CARD_API_KEY || '';
    this.environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.yellowcard.io/v1'
      : 'https://api-sandbox.yellowcard.io/v1';
    
    if (!this.apiKey) {
      console.warn('Yellow Card API key not found in environment variables');
    }
  }

  // Get sandbox test data for demo - Updated with actual Yellow Card specs
  private getSandboxTestData() {
    return {
      // KYC Auto-approval
      kyc: {
        lastName: 'Schmoe', // Auto-approves KYC in sandbox
      },
      
      // Test wallet addresses from Yellow Card documentation
      wallets: {
        success: {
          trc20: 'TWsgibKaDCiKTPqVR3Fz16XxjsmusabjDX',
          erc20: '0x839309109128d5d9871A06654c92CF5Ca5532478',
          btc: 'bc1qa8wllxyem93476c2wa9ffx2zwtkc4ln3nfh394'
        },
        successCollectionFailSettlement: {
          // Any other wallet addresses
          erc20: '0x1234567890abcdef1234567890abcdef12345678' // User's actual wallet
        },
        fail: {
          trc20: 'TNizaAsx3t68KuU2ukGcy1rsFZHbGAj1Cd',
          erc20: '0xa08D65244003a8B8095DF3E18764093F7aF557aA',
          btc: 'bc1q3nq0awvhc9jfmguaq7t2wxjrry6d4hhzk8d3xs'
        }
      },
      
      testCustomer: {
        email: 'test@payslab.com',
        firstName: 'Test',
        lastName: 'Schmoe', // This triggers auto-KYC approval
        phone: '+2348012345678',
      }
    };
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-YC-VERSION': '2024-01-01',
    };
  }

  // Get exchange rate for NGN to USDC - Updated for Sandbox
  async getExchangeRate(
    amount: number,
    fromCurrency: string = 'NGN',
    toCrypto: string = 'USDC'
  ): Promise<ApiResponse<YellowCardRateResponse>> {
    try {
      // In sandbox mode, return mock rates for demo
      if (this.environment === 'sandbox') {
        const mockRate = 1580; // ₦1,580 per USDC
        const fee = amount * 0.015; // 1.5% fee
        const cryptoAmount = (amount - fee) / mockRate;
        
        return {
          success: true,
          data: {
            rate: mockRate,
            cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
            fee: parseFloat(fee.toFixed(2)),
            totalAmount: amount,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          }
        };
      }

      // Real API call for production
      const response = await fetch(`${this.baseUrl}/rates/quote`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          fromCurrency,
          toCrypto,
        }),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get exchange rate: ${(error as Error).message}` 
      };
    }
  }

  // Create buy order for NGN to USDC
  async createBuyOrder(
    orderData: YellowCardBuyRequest
  ): Promise<ApiResponse<YellowCardBuyResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/buy`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to create buy order: ${(error as Error).message}` 
      };
    }
  }

  // Get order status
  async getOrderStatus(orderId: string): Promise<ApiResponse<YellowCardBuyResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get order status: ${(error as Error).message}` 
      };
    }
  }

  // Convert NGN to USDC (main function for your flow) - Updated with actual YC sandbox specs
  async convertNGNToUSDC(
    ngnAmount: number,
    userWalletAddress: string,
    customerData: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    },
    paymentMethod: 'bank_transfer' | 'mobile_money' | 'card' = 'bank_transfer',
    simulateSuccess: boolean = true // For demo purposes
  ): Promise<ApiResponse<YellowCardBuyResponse>> {
    try {
      // First get the current rate
      const rateResult = await this.getExchangeRate(ngnAmount, 'NGN', 'USDC');
      if (!rateResult.success) {
        return rateResult;
      }

      const testData = this.getSandboxTestData();
      
      // Determine test scenario based on wallet address and simulation preference
      let testScenario: 'success' | 'fail' | 'success_collection_fail_settlement' = 'success';
      
      if (!simulateSuccess) {
        testScenario = 'fail';
      } else if (userWalletAddress !== testData.wallets.success.erc20) {
        // User's actual wallet = success collection, fail settlement scenario
        testScenario = 'success_collection_fail_settlement';
      }

      // Use KYC-approved test customer data for sandbox
      const sandboxCustomerData = {
        ...customerData,
        lastName: testData.kyc.lastName, // Auto-approves KYC
        country: 'NG',
      };

      // Create the buy order with appropriate test wallet
      const orderData: YellowCardBuyRequest = {
        amount: ngnAmount,
        currency: 'NGN',
        crypto: 'USDC',
        paymentMethod,
        customerData: sandboxCustomerData,
        walletAddress: this.getTestWalletAddress(testScenario, userWalletAddress),
        callbackUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/webhooks/yellowcard`,
        metadata: {
          platform: 'PaySlab',
          environment: 'sandbox',
          testScenario,
          originalWallet: userWalletAddress,
          convertedAt: new Date().toISOString(),
        },
      };

      // In sandbox mode, simulate the response
      if (this.environment === 'sandbox') {
        return this.simulateYellowCardSandboxResponse(orderData, rateResult.data, testScenario);
      }

      // For production, make actual API call
      return await this.createBuyOrder(orderData);
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to convert NGN to USDC: ${(error as Error).message}` 
      };
    }
  }

  // Get appropriate test wallet address based on scenario
  private getTestWalletAddress(scenario: string, userWallet: string): string {
    const testData = this.getSandboxTestData();
    
    switch (scenario) {
      case 'success':
        return testData.wallets.success.erc20; // Full success
      case 'fail':
        return testData.wallets.fail.erc20; // Collection fails
      case 'success_collection_fail_settlement':
        return userWallet; // Collection succeeds, settlement fails
      default:
        return testData.wallets.success.erc20;
    }
  }

  // Simulate Yellow Card sandbox response with their actual behavior
  private simulateYellowCardSandboxResponse(
    orderData: YellowCardBuyRequest,
    rateData: YellowCardRateResponse,
    testScenario: string
  ): ApiResponse<YellowCardBuyResponse> {
    const orderId = `YC-${Date.now()}`;
    
    let initialStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    let finalStatus: 'completed' | 'failed' = 'completed';
    
    // Determine status based on test scenario
    switch (testScenario) {
      case 'success':
        initialStatus = 'processing';
        finalStatus = 'completed';
        break;
      case 'fail':
        initialStatus = 'failed';
        finalStatus = 'failed';
        break;
      case 'success_collection_fail_settlement':
        initialStatus = 'processing';
        finalStatus = 'failed'; // Collection succeeds but settlement fails
        break;
    }
    
    const mockResponse: YellowCardBuyResponse = {
      id: orderId,
      amount: orderData.amount,
      cryptoAmount: rateData.cryptoAmount,
      currency: orderData.currency,
      crypto: orderData.crypto,
      exchangeRate: rateData.rate,
      fee: rateData.fee,
      totalAmount: rateData.totalAmount,
      status: initialStatus,
      paymentDetails: {
        accountNumber: '0123456789', // Yellow Card sandbox account
        accountName: 'Yellow Card Sandbox',
        bankName: 'GTBank Sandbox',
        reference: `YC-${orderId}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      },
      walletAddress: orderData.walletAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate the status progression for demo
    if (testScenario !== 'fail') {
      setTimeout(() => {
        mockResponse.status = finalStatus;
        mockResponse.updatedAt = new Date().toISOString();
        
        if (finalStatus === 'completed') {
          console.log(`🎯 Yellow Card Sandbox: ${rateData.cryptoAmount} USDC sent to ${orderData.walletAddress}`);
          console.log(`📋 Order ID: ${orderId} | Scenario: ${testScenario}`);
        } else {
          console.log(`❌ Yellow Card Sandbox: Settlement failed for ${orderId}`);
        }
      }, 3000); // 3 seconds for demo visibility
    }

    return { success: true, data: mockResponse };
  }

  // Get supported payment methods for Nigeria
  async getSupportedPaymentMethods(
    country: string = 'NG'
  ): Promise<ApiResponse<Array<{
    method: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    processingTime: string;
  }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods?country=${country}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get payment methods: ${(error as Error).message}` 
      };
    }
  }

  // Get user's transaction history
  async getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<{
    transactions: YellowCardBuyResponse[];
    total: number;
    hasMore: boolean;
  }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/transactions?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get transaction history: ${(error as Error).message}` 
      };
    }
  }

  // Validate Nigerian bank account
  async validateBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<ApiResponse<{
    isValid: boolean;
    accountName?: string;
    bankName?: string;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/validation/bank-account`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          accountNumber,
          bankCode,
          country: 'NG',
        }),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to validate bank account: ${(error as Error).message}` 
      };
    }
  }

  // Get supported Nigerian banks
  async getSupportedBanks(): Promise<ApiResponse<Array<{
    code: string;
    name: string;
    country: string;
  }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/banks?country=NG`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get supported banks: ${(error as Error).message}` 
      };
    }
  }

  // Handle webhook verification
  static verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }
}

export default YellowCardService;