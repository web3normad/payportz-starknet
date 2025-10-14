// hooks/useTrades.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Trade {
  id: string
  supplier: string
  product: string
  amount: string
  quantity: string
  destination: string
  status: 'In Transit' | 'Delivered' | 'Processing' | 'Pending Payment' | 'Disputed'
  created: string
  expectedDelivery: string
  progress: number
  trackingNumber?: string
  documents?: string[]
  smartContractId?: number
  paymentMilestones?: PaymentMilestone[]
}

export interface PaymentMilestone {
  id: string
  description: string
  percentage: number
  amount: number
  status: 'pending' | 'completed' | 'failed'
  completedAt?: string
  transactionHash?: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  currency: string
  rating: number
  trades: number
  products: string[]
  accountDetails?: {
    accountNumber: string
    bankCode: string
    bankName: string
    swiftCode?: string
  }
  address?: {
    line1: string
    city: string
    state?: string
    zipCode: string
  }
  contactDetails?: {
    email: string
    phone: string
  }
}

export interface TradeCreationData {
  supplierId: string
  productName: string
  quantity: string
  amount: number
  destination: string
  deliveryTerms: string
  qualityRequirements: string
  expectedDelivery: Date
}

// Mock suppliers data
const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Shanghai Electronics Co.',
    country: 'CN',
    currency: 'CNY',
    rating: 4.8,
    trades: 156,
    products: ['Electronics', 'Components', 'Semiconductors'],
    accountDetails: {
      accountNumber: '6228480402564890000',
      bankCode: 'ICBCCNBJ',
      bankName: 'Industrial and Commercial Bank of China',
      swiftCode: 'ICBKCNBJ',
    },
    address: {
      line1: '1500 Nanjing Road East',
      city: 'Shanghai',
      state: 'Shanghai',
      zipCode: '200001',
    },
    contactDetails: {
      email: 'orders@shanghai-electronics.com',
      phone: '+86-21-5555-0123',
    }
  },
  {
    id: 'SUP-002',
    name: 'Dubai Textile Mills',
    country: 'AE',
    currency: 'AED',
    rating: 4.6,
    trades: 89,
    products: ['Textiles', 'Fabrics', 'Cotton'],
    accountDetails: {
      accountNumber: '0123456789012345',
      bankCode: 'EBILAEAD',
      bankName: 'Emirates Islamic Bank',
      swiftCode: 'EBILAEAD',
    },
    address: {
      line1: 'Dubai Textile City, Block A',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '00000',
    },
    contactDetails: {
      email: 'export@dubai-textiles.ae',
      phone: '+971-4-555-7890',
    }
  },
  {
    id: 'SUP-003',
    name: 'German Machinery Ltd',
    country: 'DE',
    currency: 'EUR',
    rating: 4.9,
    trades: 234,
    products: ['Machinery', 'Industrial Equipment', 'Tools'],
    accountDetails: {
      accountNumber: 'DE89370400440532013000',
      bankCode: 'COBADEFF',
      bankName: 'Commerzbank AG',
      swiftCode: 'COBADEFFXXX',
    },
    address: {
      line1: 'Industriestraße 42',
      city: 'Munich',
      state: 'Bavaria',
      zipCode: '80339',
    },
    contactDetails: {
      email: 'sales@german-machinery.de',
      phone: '+49-89-555-1234',
    }
  }
]

// Mock trades data
const mockTrades: Trade[] = [
  {
    id: 'TRD-001',
    supplier: 'Shanghai Electronics Co.',
    product: 'Smartphone Components',
    amount: '$12,500',
    quantity: '100 units',
    destination: 'Lagos, Nigeria',
    status: 'In Transit',
    created: '2024-12-20',
    expectedDelivery: 'Dec 28, 2024',
    progress: 65,
    trackingNumber: 'DHL1234567890',
    smartContractId: 1,
    paymentMilestones: [
      {
        id: 'M1',
        description: 'Order Confirmation',
        percentage: 20,
        amount: 2500,
        status: 'completed',
        completedAt: '2024-12-20T10:00:00Z',
        transactionHash: '0xabc123...'
      },
      {
        id: 'M2',
        description: 'Shipment Started',
        percentage: 30,
        amount: 3750,
        status: 'completed',
        completedAt: '2024-12-22T14:30:00Z',
        transactionHash: '0xdef456...'
      },
      {
        id: 'M3',
        description: 'Delivery Confirmed',
        percentage: 50,
        amount: 6250,
        status: 'pending'
      }
    ]
  },
  {
    id: 'TRD-002',
    supplier: 'Dubai Textile Mills',
    product: 'Cotton Fabric',
    amount: '$8,200',
    quantity: '50 meters',
    destination: 'Kano, Nigeria',
    status: 'Delivered',
    created: '2024-12-10',
    expectedDelivery: 'Dec 15, 2024',
    progress: 100,
    trackingNumber: 'FDX9876543210',
    smartContractId: 2,
    paymentMilestones: [
      {
        id: 'M1',
        description: 'Order Confirmation',
        percentage: 20,
        amount: 1640,
        status: 'completed',
        completedAt: '2024-12-10T10:00:00Z',
        transactionHash: '0x111222...'
      },
      {
        id: 'M2',
        description: 'Shipment Started',
        percentage: 30,
        amount: 2460,
        status: 'completed',
        completedAt: '2024-12-12T14:30:00Z',
        transactionHash: '0x333444...'
      },
      {
        id: 'M3',
        description: 'Delivery Confirmed',
        percentage: 50,
        amount: 4100,
        status: 'completed',
        completedAt: '2024-12-15T16:45:00Z',
        transactionHash: '0x555666...'
      }
    ]
  },
  {
    id: 'TRD-003',
    supplier: 'German Machinery Ltd',
    product: 'Industrial Equipment',
    amount: '$25,000',
    quantity: '1 unit',
    destination: 'Abuja, Nigeria',
    status: 'Processing',
    created: '2024-12-22',
    expectedDelivery: 'Jan 15, 2025',
    progress: 25,
    smartContractId: 3,
    paymentMilestones: [
      {
        id: 'M1',
        description: 'Order Confirmation',
        percentage: 20,
        amount: 5000,
        status: 'completed',
        completedAt: '2024-12-22T10:00:00Z',
        transactionHash: '0x777888...'
      },
      {
        id: 'M2',
        description: 'Production Started',
        percentage: 30,
        amount: 7500,
        status: 'pending'
      },
      {
        id: 'M3',
        description: 'Delivery Confirmed',
        percentage: 50,
        amount: 12500,
        status: 'pending'
      }
    ]
  }
]

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => mockSuppliers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSupplier(supplierId: string) {
  return useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      const supplier = mockSuppliers.find(s => s.id === supplierId)
      if (!supplier) throw new Error('Supplier not found')
      return supplier
    },
    enabled: !!supplierId,
  })
}

export function useTrades() {
  // Get wallet address from localStorage (ChipiPay wallet)
  const getWalletAddress = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payportz_chipiwallet_address')
    }
    return null
  }

  const address = getWalletAddress()

  return useQuery({
    queryKey: ['trades', address],
    queryFn: async () => {
      // In real app, would fetch user's trades from backend/Starknet
      return mockTrades
    },
    enabled: !!address,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useTrade(tradeId: string) {
  return useQuery({
    queryKey: ['trade', tradeId],
    queryFn: async () => {
      const trade = mockTrades.find(t => t.id === tradeId)
      if (!trade) throw new Error('Trade not found')
      return trade
    },
    enabled: !!tradeId,
  })
}

export function useCreateTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tradeData: TradeCreationData) => {
      const { supplierId, productName, quantity, amount, destination, deliveryTerms, qualityRequirements, expectedDelivery } = tradeData
      
      // Get supplier details
      const supplier = mockSuppliers.find(s => s.id === supplierId)
      if (!supplier) throw new Error('Supplier not found')

      // In real app, would create trade on Starknet smart contract using ChipiPay
      // For now, simulate the creation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create trade record
      const newTrade: Trade = {
        id: `TRD-${Date.now()}`,
        supplier: supplier.name,
        product: productName,
        amount: `$${amount.toLocaleString()}`,
        quantity,
        destination,
        status: 'Processing',
        created: new Date().toISOString().split('T')[0],
        expectedDelivery: expectedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        progress: 10,
        smartContractId: Math.floor(Math.random() * 1000),
        paymentMilestones: [
          {
            id: 'M1',
            description: 'Order Confirmation',
            percentage: 20,
            amount: amount * 0.2,
            status: 'pending'
          },
          {
            id: 'M2',
            description: 'Shipment Started',
            percentage: 30,
            amount: amount * 0.3,
            status: 'pending'
          },
          {
            id: 'M3',
            description: 'Delivery Confirmed',
            percentage: 50,
            amount: amount * 0.5,
            status: 'pending'
          }
        ]
      }

      return newTrade
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useProcessMilestonePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      tradeId: string
      milestoneId: string
      supplierId: string
      amount: number
    }) => {
      const { tradeId, milestoneId, supplierId, amount } = data
      
      // Get supplier details
      const supplier = mockSuppliers.find(s => s.id === supplierId)
      if (!supplier) throw new Error('Supplier not found')

      // In real app, would process payment via ChipiPay on Starknet
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      return {
        tradeId,
        milestoneId,
        paymentId: `PAY-${Date.now()}`,
        status: 'completed',
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useUpdateTradeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      tradeId: string
      status: Trade['status']
      progress?: number
      trackingNumber?: string
    }) => {
      // In real app, would update Starknet smart contract
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useTradeDocuments(tradeId: string) {
  return useQuery({
    queryKey: ['trade-documents', tradeId],
    queryFn: async () => {
      // Mock documents - in real app would fetch from IPFS/backend
      return [
        {
          id: 'DOC-001',
          name: 'Trade Agreement',
          type: 'agreement',
          url: `/api/documents/${tradeId}/agreement.pdf`,
          uploadedAt: '2024-12-20T10:00:00Z'
        },
        {
          id: 'DOC-002',
          name: 'Invoice',
          type: 'invoice',
          url: `/api/documents/${tradeId}/invoice.pdf`,
          uploadedAt: '2024-12-20T10:15:00Z'
        },
        {
          id: 'DOC-003',
          name: 'Bill of Lading',
          type: 'bill_of_lading',
          url: `/api/documents/${tradeId}/bill_of_lading.pdf`,
          uploadedAt: '2024-12-22T14:30:00Z'
        },
        {
          id: 'DOC-004',
          name: 'Quality Certificate',
          type: 'quality_cert',
          url: `/api/documents/${tradeId}/quality_cert.pdf`,
          uploadedAt: '2024-12-22T16:00:00Z'
        },
        {
          id: 'DOC-005',
          name: 'Shipping Documents',
          type: 'shipping_docs',
          url: `/api/documents/${tradeId}/shipping_docs.pdf`,
          uploadedAt: '2024-12-23T09:15:00Z'
        }
      ]
    },
    enabled: !!tradeId,
  })
}

export function useTradeStats() {
  const getWalletAddress = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payportz_chipiwallet_address')
    }
    return null
  }

  const address = getWalletAddress()
  const { data: trades = [] } = useTrades()

  return useQuery({
    queryKey: ['trade-stats', address, trades.length],
    queryFn: () => {
      if (!address || trades.length === 0) {
        return {
          totalTrades: 0,
          activeTrades: 0,
          completedTrades: 0,
          disputedTrades: 0,
          totalValue: 0,
          averageValue: 0,
          successRate: 0,
        }
      }

      const totalTrades = trades.length
      const activeTrades = trades.filter(t => ['In Transit', 'Processing', 'Pending Payment'].includes(t.status)).length
      const completedTrades = trades.filter(t => t.status === 'Delivered').length
      const disputedTrades = trades.filter(t => t.status === 'Disputed').length

      // Calculate total value
      const totalValue = trades.reduce((sum, trade) => {
        const amount = parseFloat(trade.amount.replace(/[$,]/g, ''))
        return sum + amount
      }, 0)

      const averageValue = totalTrades > 0 ? totalValue / totalTrades : 0
      const successRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0

      return {
        totalTrades,
        activeTrades,
        completedTrades,
        disputedTrades,
        totalValue,
        averageValue,
        successRate,
      }
    },
    enabled: !!address,
  })
}

export function useTradeDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      tradeId: string
      reason: string
      description: string
      evidence?: File[]
    }) => {
      // In real app, would create dispute in Starknet smart contract
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const dispute = {
        id: `DISPUTE-${Date.now()}`,
        tradeId: data.tradeId,
        reason: data.reason,
        description: data.description,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        evidenceHashes: data.evidence ? data.evidence.map(() => `0x${Math.random().toString(16).substring(2, 66)}`) : []
      }

      return dispute
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useShippingTracking(trackingNumber: string) {
  return useQuery({
    queryKey: ['shipping-tracking', trackingNumber],
    queryFn: async () => {
      // Mock shipping tracking - in real app would integrate with DHL/FedEx APIs
      return {
        trackingNumber,
        status: 'IN_TRANSIT',
        lastUpdate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            date: '2024-12-20T10:00:00Z',
            location: 'Shanghai, China',
            description: 'Package picked up'
          },
          {
            date: '2024-12-21T14:30:00Z',
            location: 'Shanghai Airport, China',
            description: 'Departed facility'
          },
          {
            date: '2024-12-22T08:15:00Z',
            location: 'Dubai Hub, UAE',
            description: 'In transit'
          },
          {
            date: '2024-12-23T16:45:00Z',
            location: 'Lagos Airport, Nigeria',
            description: 'Arrived at destination'
          }
        ]
      }
    },
    enabled: !!trackingNumber,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function useTradeAnalytics() {
  const getWalletAddress = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payportz_chipiwallet_address')
    }
    return null
  }

  const address = getWalletAddress()
  const { data: trades = [] } = useTrades()

  return useQuery({
    queryKey: ['trade-analytics', address, trades.length],
    queryFn: () => {
      if (!address || trades.length === 0) {
        return {
          monthlyVolume: [],
          topSuppliers: [],
          productCategories: [],
          averageDeliveryTime: 0,
        }
      }

      // Mock analytics data
      const monthlyVolume = [
        { month: 'Oct', volume: 45000 },
        { month: 'Nov', volume: 52000 },
        { month: 'Dec', volume: 67000 },
      ]

      const topSuppliers = [
        { name: 'Shanghai Electronics Co.', volume: 25000, trades: 3 },
        { name: 'Dubai Textile Mills', volume: 18000, trades: 2 },
        { name: 'German Machinery Ltd', volume: 24000, trades: 1 },
      ]

      const productCategories = [
        { category: 'Electronics', percentage: 45 },
        { category: 'Textiles', percentage: 25 },
        { category: 'Machinery', percentage: 30 },
      ]

      const averageDeliveryTime = 12 // days

      return {
        monthlyVolume,
        topSuppliers,
        productCategories,
        averageDeliveryTime,
      }
    },
    enabled: !!address,
  })
}