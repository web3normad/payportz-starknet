// hooks/useContracts.ts
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatUnits, Address } from 'viem'
import { base } from 'wagmi/chains'

// Contract addresses
const PAYSLAB_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYSLAB_CONTRACT_ADDRESS as Address
const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address

// Contract ABIs
const PAYSLAB_ABI = [
  {
    inputs: [
      { name: '_seller', type: 'address' },
      { name: '_totalAmount', type: 'uint256' },
      { name: '_deliveryDeadline', type: 'uint256' },
      { name: '_qualityStandards', type: 'string' },
      { name: '_qualityInspectionRequired', type: 'bool' }
    ],
    name: 'createTrade',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_tradeId', type: 'uint256' }],
    name: 'fundTrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_bvn', type: 'string' }],
    name: 'verifyUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserProfile',
    outputs: [
      { name: 'bvn', type: 'string' },
      { name: 'isVerified', type: 'bool' },
      { name: 'totalTrades', type: 'uint256' },
      { name: 'successfulTrades', type: 'uint256' },
      { name: 'reputationScore', type: 'uint256' },
      { name: 'joinedAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_tradeId', type: 'uint256' }],
    name: 'getTrade',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'buyer', type: 'address' },
      { name: 'seller', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'depositAmount', type: 'uint256' },
      { name: 'shipmentAmount', type: 'uint256' },
      { name: 'deliveryAmount', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'inspectionStatus', type: 'uint8' },
      { name: 'trackingNumber', type: 'string' },
      { name: 'qualityStandards', type: 'string' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'deliveryDeadline', type: 'uint256' },
      { name: 'qualityInspectionRequired', type: 'bool' },
      { name: 'inspector', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface TradeData {
  sellerAddress: Address
  amount: number
  deliveryDays: number
  qualityStandards: string
  requiresInspection: boolean
}

export interface UserProfile {
  bvn: string
  isVerified: boolean
  totalTrades: number
  successfulTrades: number
  reputationScore: number
  joinedAt: Date
}

export interface Trade {
  id: number
  buyer: Address
  seller: Address
  totalAmount: string
  depositAmount: string
  shipmentAmount: string
  deliveryAmount: string
  status: string
  inspectionStatus: string
  trackingNumber: string
  qualityStandards: string
  createdAt: Date
  deliveryDeadline: Date
  qualityInspectionRequired: boolean
  inspector: Address
}

export function usePaySlabContract() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Create Trade
  const createTrade = async (tradeData: TradeData) => {
    if (!address) throw new Error('Wallet not connected')

    const { sellerAddress, amount, deliveryDays, qualityStandards, requiresInspection } = tradeData
    const amountInWei = parseUnits(amount.toString(), 6) // USDC has 6 decimals
    const deliveryDeadline = BigInt(Math.floor(Date.now() / 1000) + (deliveryDays * 24 * 60 * 60))

    writeContract({
      address: PAYSLAB_CONTRACT_ADDRESS,
      abi: PAYSLAB_ABI,
      functionName: 'createTrade',
      args: [sellerAddress, amountInWei, deliveryDeadline, qualityStandards, requiresInspection],
    })
  }

  // Fund Trade
  const fundTrade = async (tradeId: number, amount: number) => {
    if (!address) throw new Error('Wallet not connected')

    const amountInWei = parseUnits(amount.toString(), 6)

    // First approve USDC spending
    writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [PAYSLAB_CONTRACT_ADDRESS, amountInWei],
    })

    // Then fund the trade (would need to be called after approval succeeds)
    setTimeout(() => {
      writeContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        functionName: 'fundTrade',
        args: [BigInt(tradeId)],
      })
    }, 2000)
  }

  // Verify User
  const verifyUser = async (bvn: string) => {
    if (!address) throw new Error('Wallet not connected')

    writeContract({
      address: PAYSLAB_CONTRACT_ADDRESS,
      abi: PAYSLAB_ABI,
      functionName: 'verifyUser',
      args: [bvn],
    })
  }

  return {
    createTrade,
    fundTrade,
    verifyUser,
    isWriting,
    isConfirming,
    isSuccess,
    hash,
  }
}

export function useUserProfile(userAddress?: Address) {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  const { data, isLoading, error } = useReadContract({
    address: PAYSLAB_CONTRACT_ADDRESS,
    abi: PAYSLAB_ABI,
    functionName: 'getUserProfile',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  })

  const userProfile: UserProfile | null = data ? {
    bvn: data[0],
    isVerified: data[1],
    totalTrades: Number(data[2]),
    successfulTrades: Number(data[3]),
    reputationScore: Number(data[4]),
    joinedAt: new Date(Number(data[5]) * 1000)
  } : null

  return {
    userProfile,
    isLoading,
    error
  }
}

export function useTradeDetails(tradeId: number) {
  const { data, isLoading, error } = useReadContract({
    address: PAYSLAB_CONTRACT_ADDRESS,
    abi: PAYSLAB_ABI,
    functionName: 'getTrade',
    args: [BigInt(tradeId)],
    query: {
      enabled: tradeId > 0,
    }
  })

  const statusMap = ['CREATED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'CANCELLED']
  const inspectionMap = ['PENDING', 'PASSED', 'FAILED', 'NOT_REQUIRED']

  const trade: Trade | null = data ? {
    id: Number(data[0]),
    buyer: data[1],
    seller: data[2],
    totalAmount: formatUnits(data[3], 6),
    depositAmount: formatUnits(data[4], 6),
    shipmentAmount: formatUnits(data[5], 6),
    deliveryAmount: formatUnits(data[6], 6),
    status: statusMap[data[7]] || 'UNKNOWN',
    inspectionStatus: inspectionMap[data[8]] || 'UNKNOWN',
    trackingNumber: data[9],
    qualityStandards: data[10],
    createdAt: new Date(Number(data[11]) * 1000),
    deliveryDeadline: new Date(Number(data[12]) * 1000),
    qualityInspectionRequired: data[13],
    inspector: data[14]
  } : null

  return {
    trade,
    isLoading,
    error
  }
}

export function useUSDCBalance(userAddress?: Address) {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  const { data, isLoading, error, refetch } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  })

  const balance = data ? parseFloat(formatUnits(data, 6)) : 0

  return {
    balance,
    isLoading,
    error,
    refetch
  }
}