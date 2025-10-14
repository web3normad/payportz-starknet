// hooks/useYellowCard.ts
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface YellowCardRateResponse {
  rate: number
  cryptoAmount: number
  fee: number
  totalAmount: number
  expiresAt: string
}

interface YellowCardOrderResponse {
  id: string
  amount: number
  cryptoAmount: number
  currency: string
  crypto: string
  exchangeRate: number
  fee: number
  totalAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  paymentDetails: {
    accountNumber?: string
    accountName?: string
    bankName?: string
    reference: string
    expiresAt: string
  }
  walletAddress: string
  createdAt: string
  updatedAt: string
}

interface YellowCardOrderRequest {
  amount: number
  currency: string
  crypto: string
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'card'
  customerData: {
    email: string
    firstName: string
    lastName: string
    phone: string
    country: string
  }
  walletAddress: string
  callbackUrl?: string
  metadata?: any
}

class YellowCardService {
  private apiKey: string
  private baseUrl: string
  private environment: 'sandbox' | 'production'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YELLOW_CARD_API_KEY || ''
    this.environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.yellowcard.io/v1'
      : 'https://api-sandbox.yellowcard.io/v1'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-YC-VERSION': '2024-01-01',
    }
  }

  async getExchangeRate(
    amount: number,
    fromCurrency: string = 'NGN',
    toCrypto: string = 'USDC'
  ): Promise<YellowCardRateResponse> {
    // In sandbox mode, return mock rates
    if (this.environment === 'sandbox') {
      const mockRate = 1580
      const fee = amount * 0.015
      const cryptoAmount = (amount - fee) / mockRate
      
      return {
        rate: mockRate,
        cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
        fee: parseFloat(fee.toFixed(2)),
        totalAmount: amount,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }
    }

    const response = await fetch(`${this.baseUrl}/rates/quote`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCrypto,
      }),
    })

    if (!response.ok) {
      throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async createBuyOrder(orderData: YellowCardOrderRequest): Promise<YellowCardOrderResponse> {
    // In sandbox mode, return mock response
    if (this.environment === 'sandbox') {
      const orderId = `YC-${Date.now()}`
      const rateData = await this.getExchangeRate(orderData.amount, orderData.currency, orderData.crypto)
      
      return {
        id: orderId,
        amount: orderData.amount,
        cryptoAmount: rateData.cryptoAmount,
        currency: orderData.currency,
        crypto: orderData.crypto,
        exchangeRate: rateData.rate,
        fee: rateData.fee,
        totalAmount: rateData.totalAmount,
        status: 'processing',
        paymentDetails: {
          accountNumber: '0123456789',
          accountName: 'Yellow Card Sandbox',
          bankName: 'GTBank Sandbox',
          reference: `YC-${orderId}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        walletAddress: orderData.walletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    const response = await fetch(`${this.baseUrl}/orders/buy`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getOrderStatus(orderId: string): Promise<YellowCardOrderResponse> {
    // Mock status check in sandbox
    if (this.environment === 'sandbox') {
      return {
        id: orderId,
        amount: 1000000,
        cryptoAmount: 632.91,
        currency: 'NGN',
        crypto: 'USDC',
        exchangeRate: 1580,
        fee: 15000,
        totalAmount: 1015000,
        status: 'completed',
        paymentDetails: {
          accountNumber: '0123456789',
          accountName: 'Yellow Card Sandbox',
          bankName: 'GTBank Sandbox',
          reference: `YC-${orderId}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Yellow Card API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

const yellowCardService = new YellowCardService()

export function useYellowCardRate(amount: number, fromCurrency = 'NGN', toCrypto = 'USDC') {
  return useQuery({
    queryKey: ['yellowcard-rate', amount, fromCurrency, toCrypto],
    queryFn: () => yellowCardService.getExchangeRate(amount, fromCurrency, toCrypto),
    enabled: amount > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function useYellowCardConversion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      amount: number
      userDetails: {
        email: string
        firstName: string
        lastName: string
        phone: string
        walletAddress: string
      }
    }) => {
      const { amount, userDetails } = data
      
      const orderData: YellowCardOrderRequest = {
        amount,
        currency: 'NGN',
        crypto: 'USDC',
        paymentMethod: 'bank_transfer',
        customerData: {
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          phone: userDetails.phone,
          country: 'NG',
        },
        walletAddress: userDetails.walletAddress,
        callbackUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/webhooks/yellowcard`,
      }

      return yellowCardService.createBuyOrder(orderData)
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['yellowcard-orders'] })
    },
  })
}

export function useYellowCardOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ['yellowcard-order', orderId],
    queryFn: () => yellowCardService.getOrderStatus(orderId),
    enabled: !!orderId,
    refetchInterval: 10 * 1000, // Check status every 10 seconds
  })
}

export function useYellowCardOrders() {
  // This would typically fetch user's order history
  return useQuery({
    queryKey: ['yellowcard-orders'],
    queryFn: async () => {
      // Mock implementation - in real app would fetch from API
      return [
        {
          id: 'YC-001',
          amount: 1000000,
          cryptoAmount: 632.91,
          currency: 'NGN',
          crypto: 'USDC',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'YC-002',
          amount: 500000,
          cryptoAmount: 316.46,
          currency: 'NGN',
          crypto: 'USDC',
          status: 'processing',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ]
    },
  })
}