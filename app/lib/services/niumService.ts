// lib/services/niumService.ts
import { ApiResponse } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Nium API Types
interface NiumBeneficiary {
  id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nationality?: string;
  dateOfBirth?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };
  contactDetails: {
    countryCode: string;
    mobileNumber: string;
    email: string;
  };
  accountDetails: {
    accountNumber: string;
    accountType: 'SAVINGS' | 'CURRENT' | 'CHECKING';
    bankName: string;
    bankCode: string;
    branchCode?: string;
    iban?: string;
    swiftCode?: string;
  };
  payoutMethod: 'BANK_TRANSFER' | 'CASH_PICKUP' | 'WALLET';
}

interface NiumTransferRequest {
  beneficiaryId: string;
  amount: number;
  sourceCurrencyCode: string;
  destinationCurrencyCode: string;
  purposeCode: string;
  customerComments?: string;
  bankReferenceNumber?: string;
  auditId?: string;
}

interface NiumTransferResponse {
  systemReferenceNumber: string;
  customerReferenceNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  destinationAmount: number;
  exchangeRate: number;
  fees: number;
  estimatedTimeOfArrival: string;
  createdAt: string;
}

interface NiumQuoteRequest {
  sourceCurrencyCode: string;
  destinationCurrencyCode: string;
  sourceAmount?: number;
  destinationAmount?: number;
}

interface NiumQuoteResponse {
  auditId: string;
  sourceCurrencyCode: string;
  destinationCurrencyCode: string;
  sourceAmount: number;
  destinationAmount: number;
  exchangeRate: number;
  fees: number;
  expiryTime: string;
}

class NiumService {
  private apiKey: string;
  private baseUrl: string;
  private clientHashId: string;
  private customerHashId: string;
  private walletHashId: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NIUM_API_KEY || '';
    this.baseUrl = 'https://gateway.nium.com/api/v1';
    
    // These would be set during client onboarding
    this.clientHashId = process.env.NEXT_PUBLIC_NIUM_CLIENT_HASH_ID || '';
    this.customerHashId = process.env.NEXT_PUBLIC_NIUM_CUSTOMER_HASH_ID || '';
    this.walletHashId = process.env.NEXT_PUBLIC_NIUM_WALLET_HASH_ID || '';
    
    if (!this.apiKey) {
      console.warn('Nium API key not found in environment variables');
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-request-id': uuidv4(),
      'x-client-name': 'PaySlab',
    };
  }

  // Get exchange rate quote
  async getExchangeQuote(
    sourceCurrency: string,
    destinationCurrency: string,
    sourceAmount?: number,
    destinationAmount?: number
  ): Promise<ApiResponse<NiumQuoteResponse>> {
    try {
      const quoteData: NiumQuoteRequest = {
        sourceCurrencyCode: sourceCurrency,
        destinationCurrencyCode: destinationCurrency,
        sourceAmount,
        destinationAmount
      };

      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/quote`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(quoteData),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get exchange quote: ${(error as Error).message}` 
      };
    }
  }

  // Create beneficiary
  async createBeneficiary(
    beneficiaryData: NiumBeneficiary
  ): Promise<ApiResponse<{ beneficiaryId: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/beneficiary`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(beneficiaryData),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: { beneficiaryId: data.id } };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to create beneficiary: ${(error as Error).message}` 
      };
    }
  }

  // Send money to beneficiary
  async sendMoney(
    transferData: NiumTransferRequest
  ): Promise<ApiResponse<NiumTransferResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/remittance`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            beneficiary: {
              id: transferData.beneficiaryId
            },
            ...transferData
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to send money: ${(error as Error).message}` 
      };
    }
  }

  // Get transfer status
  async getTransferStatus(
    systemReferenceNumber: string
  ): Promise<ApiResponse<NiumTransferResponse & { 
    remittanceLifecycleStatus: string;
    paymentReference: string;
  }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/remittance/${systemReferenceNumber}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get transfer status: ${(error as Error).message}` 
      };
    }
  }

  // Get supported corridors (countries and currencies)
  async getSupportedCorridors(): Promise<ApiResponse<Array<{
    destinationCountry: string;
    destinationCurrency: string;
    payoutMethods: string[];
    minimumAmount: number;
    maximumAmount: number;
  }>>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/corridors`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get supported corridors: ${(error as Error).message}` 
      };
    }
  }

  // Get purpose codes for different countries
  async getPurposeCodes(
    destinationCountry: string
  ): Promise<ApiResponse<Array<{
    code: string;
    description: string;
  }>>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/purpose-codes?destinationCountry=${destinationCountry}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get purpose codes: ${(error as Error).message}` 
      };
    }
  }

  // Validate beneficiary account
  async validateBeneficiaryAccount(
    accountNumber: string,
    bankCode: string,
    country: string
  ): Promise<ApiResponse<{
    isValid: boolean;
    accountHolderName?: string;
  }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/validate-account`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            accountNumber,
            bankCode,
            country,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to validate beneficiary account: ${(error as Error).message}` 
      };
    }
  }

  // Send money to supplier (high-level method)
  async sendToSupplier(
    supplierData: {
      name: string;
      email: string;
      phone: string;
      country: string;
      accountNumber: string;
      bankCode: string;
      bankName: string;
      address: {
        line1: string;
        city: string;
        state?: string;
        zipCode: string;
      };
    },
    amount: number,
    currency: string,
    purposeCode: string = 'GOODS_TRADE',
    comments?: string
  ): Promise<ApiResponse<{
    transferId: string;
    beneficiaryId: string;
    status: string;
    estimatedArrival: string;
  }>> {
    try {
      // First, create beneficiary
      const beneficiaryResult = await this.createBeneficiary({
        firstName: supplierData.name.split(' ')[0],
        lastName: supplierData.name.split(' ').slice(1).join(' ') || 'Supplier',
        address: {
          addressLine1: supplierData.address.line1,
          city: supplierData.address.city,
          state: supplierData.address.state,
          country: supplierData.country,
          zipCode: supplierData.address.zipCode,
        },
        contactDetails: {
          countryCode: supplierData.phone.substring(0, 3),
          mobileNumber: supplierData.phone.substring(3),
          email: supplierData.email,
        },
        accountDetails: {
          accountNumber: supplierData.accountNumber,
          accountType: 'CURRENT',
          bankName: supplierData.bankName,
          bankCode: supplierData.bankCode,
        },
        payoutMethod: 'BANK_TRANSFER',
      });

      if (!beneficiaryResult.success) {
        return beneficiaryResult;
      }

      // Get exchange quote
      const quoteResult = await this.getExchangeQuote('USD', currency, amount);
      if (!quoteResult.success) {
        return quoteResult;
      }

      // Send money
      const transferResult = await this.sendMoney({
        beneficiaryId: beneficiaryResult.data.beneficiaryId,
        amount,
        sourceCurrencyCode: 'USD',
        destinationCurrencyCode: currency,
        purposeCode,
        customerComments: comments,
        auditId: quoteResult.data.auditId,
      });

      if (!transferResult.success) {
        return transferResult;
      }

      return {
        success: true,
        data: {
          transferId: transferResult.data.systemReferenceNumber,
          beneficiaryId: beneficiaryResult.data.beneficiaryId,
          status: transferResult.data.status,
          estimatedArrival: transferResult.data.estimatedTimeOfArrival,
        },
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to send to supplier: ${(error as Error).message}` 
      };
    }
  }

  // Get wallet balance
  async getWalletBalance(
    currencyCode?: string
  ): Promise<ApiResponse<Array<{
    currency: string;
    balance: number;
    availableBalance: number;
  }>>> {
    try {
      const url = currencyCode 
        ? `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/balance?currencyCode=${currencyCode}`
        : `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/balance`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: currencyCode ? [data] : data };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get wallet balance: ${(error as Error).message}` 
      };
    }
  }

  // Fund wallet (for testing/demo purposes)
  async fundWallet(
    amount: number,
    currencyCode: string = 'USD'
  ): Promise<ApiResponse<{ transactionId: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/client/${this.clientHashId}/customer/${this.customerHashId}/wallet/${this.walletHashId}/fund`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            amount,
            destinationCurrencyCode: currencyCode,
            sourceCurrencyCode: currencyCode,
            fundingChannel: 'BANK_TRANSFER',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Nium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: { transactionId: data.transactionId } };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fund wallet: ${(error as Error).message}` 
      };
    }
  }
}

export default NiumService;