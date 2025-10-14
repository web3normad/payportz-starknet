// hooks/usePayCrest.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface PayCrestRateResponse {
  rate: string
  fee: string
  receivableAmount: string
  expiresAt: string
}

interface PayCrestOrderResponse {
  id: string
  amount: string
  amountPaid: string
  amountReturned: string
  token: string
  senderFee: string
  transactionFee: string
  rate: string
  network: string
  gatewayId: string
  reference: string
  recipient: {
    institution: string
    accountIdentifier: string
    accountName: string
    memo?: string
  }
  fromAddress: string
  returnAddress: string
  receiveAddress: string
  feeAddress: string
  createdAt: string
  updatedAt: string
  txHash?: string
  status: 'initiated' | 'crypto_deposited' | 'validated' | 'expired' | 'settled' | 'refunded'
  transactions: Array<{
    id: string
    gatewayId: string
    status: string
    txHash: string
    createdAt: string
  }>
}

interface PayCrestOrderRequest {
  amount: string
  token: string
  network: string
  recipient: {
    institution: string
    accountIdentifier: string
    accountName: string
    memo?: string
  }
  senderFee?: string
  transactionFee?: string
  reference?: string
  returnAddress?: string
  feeAddress?: string
}

class PayCrestService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PAYCREST_API_KEY || ''
    this.baseUrl = 'https://api.paycrest.io/v1'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'API-Key': this.apiKey,
    }
  }

  async getExchangeRate(
    amount: string,
    token: string = 'USDC',
    network: string = 'base',
    destinationCurrency: string = 'NGN'
  ): Promise<PayCrestRateResponse> {
    // Mock implementation for demo
    const mockRate = destinationCurrency === 'NGN' ? '1620' : '1'
    const fee = (parseFloat(amount) * 0.015).toString() // 1.5% fee
    const receivableAmount = (parseFloat(amount) * parseFloat(mockRate) - parseFloat(fee)).toString()

    return {
      rate: mockRate,
      fee,
      receivableAmount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }
  }

  async createOffRampOrder(
    amount: string,
    recipientDetails: {
      bankCode: string
      accountNumber: string
      accountName: string
      memo?: string
    },
    options?: {
      token?: string
      network?: string
      reference?: string
      returnAddress?: string
    }
  ): Promise<PayCrestOrderResponse> {
    // Mock implementation
    const orderId = `PC-${Date.now()}`
    const rateData = await this.getExchangeRate(amount, options?.token, options?.network)

    return {
      id: orderId,
      amount,
      amountPaid: '0',
      amountReturned: '0',
      token: options?.token || 'USDC',
      senderFee: '0',
      transactionFee: rateData.fee,
      rate: rateData.rate,
      network: options?.network || 'base',
      gatewayId: `GW-${Date.now()}`,
      reference: options?.reference || `PAYSLAB-${Date.now()}`,
      recipient: {
        institution: recipientDetails.bankCode,
        accountIdentifier: recipientDetails.accountNumber,
        accountName: recipientDetails.accountName,
        memo: recipientDetails.memo,
      },
      fromAddress: '0x0000000000000000000000000000000000000000',
      returnAddress: options?.returnAddress || '0x0000000000000000000000000000000000000000',
      receiveAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      feeAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'initiated',
      transactions: [],
    }
  }

  async getOrderStatus(orderId: string): Promise<PayCrestOrderResponse> {
    // Mock implementation
    return {
      id: orderId,
      amount: '1000',
      amountPaid: '1000',
      amountReturned: '0',
      token: 'USDC',
      senderFee: '0',
      transactionFee: '15',
      rate: '1620',
      network: 'base',
      gatewayId: `GW-${Date.now()}`,
      reference: `PAYSLAB-${orderId}`,
      recipient: {
        institution: 'GTBINGLA',
        accountIdentifier: '0123456789',
        accountName: 'John Doe',
      },
      fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
      returnAddress: '0x1234567890abcdef1234567890abcdef12345678',
      receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      feeAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'settled',
      transactions: [
        {
          id: `TX-${Date.now()}`,
          gatewayId: `GW-${Date.now()}`,
          status: 'confirmed',
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          createdAt: new Date().toISOString(),
        },
      ],
    }
  }

  async convertUSDCToNGN(
    amount: string,
    recipientDetails: {
      accountNumber: string
      accountName: string
      bankCode?: string
    },
    returnAddress?: string
  ): Promise<PayCrestOrderResponse> {
    return this.createOffRampOrder(
      amount,
      {
        bankCode: recipientDetails.bankCode || 'GTBINGLA',
        accountNumber: recipientDetails.accountNumber,
        accountName: recipientDetails.accountName,
        memo: 'PaySlab USDC to NGN conversion',
      },
      {
        returnAddress,
        reference: `CONVERT-${Date.now()}`,
      }
    )
  }

  async getSupportedInstitutions(): Promise<Array<{
    code: string
    name: string
    country: string
  }>> {
    // Mock Nigerian banks
    return [
      { code: 'GTBINGLA', name: 'Guaranty Trust Bank', country: 'NG' },
      { code: 'FIRSTBNG', name: 'First Bank of Nigeria', country: 'NG' },
      { code: 'ZEIBNGLA', name: 'Zenith Bank', country: 'NG' },
      { code: 'UBNINGLA', name: 'United Bank for Africa', country: 'NG' },
      { code: 'ABNGNGLA', name: 'Access Bank', country: 'NG' },
    ]
  }

  async validateAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<{
    isValid: boolean
    accountName?: string
  }> {
    // Mock validation
    return {
      isValid: accountNumber.length === 10,
      accountName: accountNumber.length === 10 ? 'John Doe' : undefined,
    }
  }
}

const payCrestService = new PayCrestService()

export function usePayCrestRate(amount: string, token = 'USDC', network = 'base', destinationCurrency = 'NGN') {
  return useQuery({
    queryKey: ['paycrest-rate', amount, token, network, destinationCurrency],
    queryFn: () => payCrestService.getExchangeRate(amount, token, network, destinationCurrency),
    enabled: parseFloat(amount) > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function usePayCrestOffRamp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      amount: string
      recipientDetails: {
        bankCode: string
        accountNumber: string
        accountName: string
        memo?: string
      }
      options?: {
        token?: string
        network?: string
        reference?: string
        returnAddress?: string
      }
    }) => {
      const { amount, recipientDetails, options } = data
      return payCrestService.createOffRampOrder(amount, recipientDetails, options)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paycrest-orders'] })
    },
  })
}

export function usePayCrestUSDCToNGN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      amount: string
      recipientDetails: {
        accountNumber: string
        accountName: string
        bankCode?: string
      }
      returnAddress?: string
    }) => {
      const { amount, recipientDetails, returnAddress } = data
      return payCrestService.convertUSDCToNGN(amount, recipientDetails, returnAddress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paycrest-orders'] })
    },
  })
}

export function usePayCrestOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ['paycrest-order', orderId],
    queryFn: () => payCrestService.getOrderStatus(orderId),
    enabled: !!orderId,
    refetchInterval: 30 * 1000, // Check status every 30 seconds
  })
}

export function usePayCrestOrders() {
  return useQuery({
    queryKey: ['paycrest-orders'],
    queryFn: async () => {
      // Mock implementation - would fetch user's order history
      return [
        {
          id: 'PC-001',
          amount: '500',
          token: 'USDC',
          status: 'settled',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          receivableAmount: '810000', // NGN
        },
        {
          id: 'PC-002',
          amount: '250',
          token: 'USDC',
          status: 'crypto_deposited',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          receivableAmount: '405000', // NGN
        },
      ]
    },
  })
}

export function usePayCrestBanks() {
  return useQuery({
    queryKey: ['paycrest-banks'],
    queryFn: () => payCrestService.getSupportedInstitutions(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function usePayCrestAccountValidation() {
  return useMutation({
    mutationFn: (data: { accountNumber: string; bankCode: string }) =>
      payCrestService.validateAccount(data.accountNumber, data.bankCode),
  })
}