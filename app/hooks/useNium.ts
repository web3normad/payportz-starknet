// hooks/useNium.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface NiumQuoteResponse {
  auditId: string
  sourceCurrencyCode: string
  destinationCurrencyCode: string
  sourceAmount: number
  destinationAmount: number
  exchangeRate: number
  fees: number
  expiryTime: string
}

interface NiumTransferResponse {
  systemReferenceNumber: string
  customerReferenceNumber: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  amount: number
  destinationAmount: number
  exchangeRate: number
  fees: number
  estimatedTimeOfArrival: string
  createdAt: string
}

interface NiumBeneficiary {
  firstName: string
  lastName: string
  nationality?: string
  address: {
    addressLine1: string
    city: string
    state?: string
    country: string
    zipCode: string
  }
  contactDetails: {
    countryCode: string
    mobileNumber: string
    email: string
  }
  accountDetails: {
    accountNumber: string
    accountType: 'SAVINGS' | 'CURRENT' | 'CHECKING'
    bankName: string
    bankCode: string
    swiftCode?: string
  }
}

interface SupplierPaymentData {
  supplierName: string
  email: string
  phone: string
  country: string
  accountNumber: string
  bankCode: string
  bankName: string
  address: {
    line1: string
    city: string
    state?: string
    zipCode: string
  }
  amount: number
  currency: string
  purposeCode?: string
  comments?: string
}

class NiumService {
  private apiKey: string
  private baseUrl: string
  private clientHashId: string
  private customerHashId: string
  private walletHashId: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NIUM_API_KEY || ''
    this.baseUrl = 'https://gateway.nium.com/api/v1'
    this.clientHashId = process.env.NEXT_PUBLIC_NIUM_CLIENT_HASH_ID || 'demo-client'
    this.customerHashId = process.env.NEXT_PUBLIC_NIUM_CUSTOMER_HASH_ID || 'demo-customer'
    this.walletHashId = process.env.NEXT_PUBLIC_NIUM_WALLET_HASH_ID || 'demo-wallet'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-request-id': crypto.randomUUID(),
      'x-client-name': 'PaySlab',
    }
  }

  async getExchangeQuote(
    sourceCurrency: string,
    destinationCurrency: string,
    sourceAmount: number
  ): Promise<NiumQuoteResponse> {
    // Mock implementation for demo
    const mockRates: Record<string, number> = {
      'USD-NGN': 1620,
      'USD-CNY': 7.2,
      'USD-AED': 3.67,
      'USD-EUR': 0.92,
    }

    const rateKey = `${sourceCurrency}-${destinationCurrency}`
    const rate = mockRates[rateKey] || 1
    const fees = sourceAmount * 0.02 // 2% fee
    const destinationAmount = (sourceAmount - fees) * rate

    return {
      auditId: `AUDIT-${Date.now()}`,
      sourceCurrencyCode: sourceCurrency,
      destinationCurrencyCode: destinationCurrency,
      sourceAmount,
      destinationAmount,
      exchangeRate: rate,
      fees,
      expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }
  }

  async createBeneficiary(beneficiaryData: NiumBeneficiary): Promise<{ beneficiaryId: string }> {
    // Mock implementation
    return {
      beneficiaryId: `BEN-${Date.now()}`,
    }
  }

  async sendMoney(
    beneficiaryId: string,
    amount: number,
    sourceCurrency: string,
    destinationCurrency: string,
    purposeCode: string = 'GOODS_TRADE',
    auditId?: string
  ): Promise<NiumTransferResponse> {
    // Mock implementation
    const quote = await this.getExchangeQuote(sourceCurrency, destinationCurrency, amount)
    
    return {
      systemReferenceNumber: `NIUM-${Date.now()}`,
      customerReferenceNumber: `CUST-${Date.now()}`,
      status: 'PROCESSING',
      amount,
      destinationAmount: quote.destinationAmount,
      exchangeRate: quote.exchangeRate,
      fees: quote.fees,
      estimatedTimeOfArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      createdAt: new Date().toISOString(),
    }
  }

  async getTransferStatus(systemReferenceNumber: string): Promise<NiumTransferResponse> {
    // Mock implementation
    return {
      systemReferenceNumber,
      customerReferenceNumber: `CUST-${Date.now()}`,
      status: 'COMPLETED',
      amount: 1000,
      destinationAmount: 1620000,
      exchangeRate: 1620,
      fees: 20,
      estimatedTimeOfArrival: new Date().toISOString(),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  async sendToSupplier(supplierData: SupplierPaymentData): Promise<{
    transferId: string
    beneficiaryId: string
    status: string
    estimatedArrival: string
  }> {
    // Create beneficiary
    const beneficiary: NiumBeneficiary = {
      firstName: supplierData.supplierName.split(' ')[0],
      lastName: supplierData.supplierName.split(' ').slice(1).join(' ') || 'Supplier',
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
    }

    const beneficiaryResult = await this.createBeneficiary(beneficiary)
    const quote = await this.getExchangeQuote('USD', supplierData.currency, supplierData.amount)
    const transferResult = await this.sendMoney(
      beneficiaryResult.beneficiaryId,
      supplierData.amount,
      'USD',
      supplierData.currency,
      supplierData.purposeCode,
      quote.auditId
    )

    return {
      transferId: transferResult.systemReferenceNumber,
      beneficiaryId: beneficiaryResult.beneficiaryId,
      status: transferResult.status,
      estimatedArrival: transferResult.estimatedTimeOfArrival,
    }
  }
}

const niumService = new NiumService()

export function useNiumQuote(sourceCurrency: string, destinationCurrency: string, amount: number) {
  return useQuery({
    queryKey: ['nium-quote', sourceCurrency, destinationCurrency, amount],
    queryFn: () => niumService.getExchangeQuote(sourceCurrency, destinationCurrency, amount),
    enabled: amount > 0 && !!sourceCurrency && !!destinationCurrency,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function useNiumSupplierPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (supplierData: SupplierPaymentData) => niumService.sendToSupplier(supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nium-transfers'] })
    },
  })
}

export function useNiumTransferStatus(transferId: string) {
  return useQuery({
    queryKey: ['nium-transfer', transferId],
    queryFn: () => niumService.getTransferStatus(transferId),
    enabled: !!transferId,
    refetchInterval: 30 * 1000, // Check status every 30 seconds
  })
}

export function useNiumTransfers() {
  return useQuery({
    queryKey: ['nium-transfers'],
    queryFn: async () => {
      // Mock implementation - would fetch user's transfer history
      return [
        {
          id: 'NIUM-001',
          supplier: 'Shanghai Electronics Co.',
          amount: 2500,
          currency: 'USD',
          destinationCurrency: 'CNY',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'NIUM-002',
          supplier: 'Dubai Textile Mills',
          amount: 1800,
          currency: 'USD',
          destinationCurrency: 'AED',
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ]
    },
  })
}