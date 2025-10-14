// hooks/useWallet.ts
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { useUSDCBalance } from './useContracts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base } from 'wagmi/chains'

export interface WalletTransaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'conversion' | 'trade_payment' | 'trade_received'
  amount: string
  currency: 'NGN' | 'USDC' | 'ETH'
  status: 'completed' | 'pending' | 'failed'
  description: string
  date: string
  fee?: string
  reference?: string
  hash?: string
  from?: string
  to?: string
}

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const queryClient = useQueryClient()

  // Get ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId: base.id,
  })

  // Get USDC balance
  const { balance: usdcBalance, isLoading: usdcLoading, refetch: refetchUSDC } = useUSDCBalance(address)

  // Check if on correct network
  const isCorrectNetwork = chainId === base.id

  const refreshBalances = () => {
    refetchUSDC()
    queryClient.invalidateQueries({ queryKey: ['balance'] })
  }

  return {
    address,
    isConnected,
    isCorrectNetwork,
    ethBalance: ethBalance ? parseFloat(ethBalance.formatted) : 0,
    usdcBalance,
    isLoadingBalances: ethLoading || usdcLoading,
    disconnect,
    refreshBalances,
  }
}

export function useWalletTransactions() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['wallet-transactions', address],
    queryFn: async (): Promise<WalletTransaction[]> => {
      // Mock implementation - in real app would fetch from blockchain/API
      if (!address) return []

      return [
        {
          id: 'tx1',
          type: 'conversion',
          amount: '1,000',
          currency: 'USDC',
          status: 'completed',
          description: 'NGN to USDC Conversion',
          date: '2 hours ago',
          fee: '$15',
          reference: 'CNV-001',
          hash: '0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
        },
        {
          id: 'tx2',
          type: 'trade_payment',
          amount: '2,500',
          currency: 'USDC',
          status: 'completed',
          description: 'Payment to Shanghai Electronics',
          date: '1 day ago',
          reference: 'TRD-001',
          hash: '0xefgh5678901234efgh5678901234efgh5678901234efgh5678901234efgh5678'
        },
        {
          id: 'tx3',
          type: 'deposit',
          amount: '1,580,000',
          currency: 'NGN',
          status: 'completed',
          description: 'Bank Transfer Deposit',
          date: '2 days ago',
          fee: 'Free'
        },
        {
          id: 'tx4',
          type: 'trade_received',
          amount: '500',
          currency: 'USDC',
          status: 'pending',
          description: 'Payment from Cashew Export LoC',
          date: '3 days ago',
          reference: 'LOC-001'
        },
        {
          id: 'tx5',
          type: 'withdrawal',
          amount: '100,000',
          currency: 'NGN',
          status: 'failed',
          description: 'Bank Withdrawal',
          date: '5 days ago',
          fee: '₦50'
        }
      ]
    },
    enabled: !!address,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useWalletStats() {
  const { address } = useAccount()
  const { data: transactions = [] } = useWalletTransactions()

  return useQuery({
    queryKey: ['wallet-stats', address, transactions.length],
    queryFn: () => {
      if (!address || transactions.length === 0) {
        return {
          totalVolume: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalFeesSpent: 0,
        }
      }

      const totalTransactions = transactions.length
      const successfulTransactions = transactions.filter(tx => tx.status === 'completed').length
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length
      const failedTransactions = transactions.filter(tx => tx.status === 'failed').length

      // Calculate total volume in USD
      const totalVolume = transactions.reduce((sum, tx) => {
        if (tx.status !== 'completed') return sum
        
        const amount = parseFloat(tx.amount.replace(/[,$]/g, ''))
        if (tx.currency === 'USDC') {
          return sum + amount
        } else if (tx.currency === 'NGN') {
          return sum + (amount / 1580) // Convert NGN to USD
        }
        return sum
      }, 0)

      // Calculate total fees spent
      const totalFeesSpent = transactions.reduce((sum, tx) => {
        if (!tx.fee) return sum
        const fee = parseFloat(tx.fee.replace(/[₦$,]/g, ''))
        return sum + fee
      }, 0)

      return {
        totalVolume,
        totalTransactions,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        totalFeesSpent,
      }
    },
    enabled: !!address,
  })
}

export function useWalletPortfolio() {
  const { usdcBalance, ethBalance, isLoadingBalances } = useWallet()

  return useQuery({
    queryKey: ['wallet-portfolio', usdcBalance, ethBalance],
    queryFn: () => {
      if (isLoadingBalances) return null

      // Mock ETH price
      const ethPrice = 3200
      const ethValue = ethBalance * ethPrice
      const totalValue = usdcBalance + ethValue

      const portfolio = [
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: usdcBalance,
          value: usdcBalance,
          percentage: totalValue > 0 ? (usdcBalance / totalValue) * 100 : 0,
          change24h: 0, // Stablecoin
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          value: ethValue,
          percentage: totalValue > 0 ? (ethValue / totalValue) * 100 : 0,
          change24h: 2.5, // Mock change
        },
      ]

      return {
        totalValue,
        assets: portfolio,
        change24h: 1.2, // Mock overall change
      }
    },
    enabled: !isLoadingBalances,
  })
}