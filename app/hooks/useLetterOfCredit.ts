// hooks/useLetterOfCredit.ts
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parseUnits, formatUnits, Address } from 'viem'

// Smart LoC Contract Address
const SMART_LOC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SMART_LOC_CONTRACT_ADDRESS as Address

// Smart LoC Contract ABI
const SMART_LOC_ABI = [
  {
    inputs: [
      { name: '_exportType', type: 'string' },
      { name: '_quantity', type: 'uint256' },
      { name: '_valueUSD', type: 'uint256' },
      { name: '_buyerCountry', type: 'string' },
      { name: '_buyerAddress', type: 'address' },
      { name: '_deliveryTerms', type: 'string' },
      { name: '_qualityStandards', type: 'string' }
    ],
    name: 'createAgriculturalLoC',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_locId', type: 'uint256' }],
    name: 'fundLoC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_locId', type: 'uint256' },
      { name: '_inspectionResult', type: 'bool' },
      { name: '_certificateHash', type: 'string' }
    ],
    name: 'submitQualityInspection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_locId', type: 'uint256' },
      { name: '_trackingNumber', type: 'string' }
    ],
    name: 'confirmShipment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_locId', type: 'uint256' }],
    name: 'confirmDelivery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_locId', type: 'uint256' }],
    name: 'getLoC',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'exporter', type: 'address' },
      { name: 'buyer', type: 'address' },
      { name: 'exportType', type: 'string' },
      { name: 'quantity', type: 'uint256' },
      { name: 'valueUSD', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'qualityInspected', type: 'bool' },
      { name: 'shipped', type: 'bool' },
      { name: 'delivered', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'qualityStandards', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_exporter', type: 'address' }],
    name: 'getExporterLoCs',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface LetterOfCreditData {
  exportType: string
  quantity: number
  valueUSD: number
  buyerCountry: string
  buyerAddress: string
  deliveryTerms: string
}

interface LetterOfCredit {
  id: number
  exporter: Address
  buyer: Address
  exportType: string
  quantity: string
  valueUSD: string
  status: string
  qualityInspected: boolean
  shipped: boolean
  delivered: boolean
  createdAt: Date
  qualityStandards: string
}

export function useSmartLetterOfCredit() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Create Agricultural Letter of Credit
  const createAgriculturalLoC = async (locData: LetterOfCreditData) => {
    if (!address) throw new Error('Wallet not connected')

    const { exportType, quantity, valueUSD, buyerCountry, buyerAddress, deliveryTerms } = locData
    const valueInWei = parseUnits(valueUSD.toString(), 6) // USDC has 6 decimals
    const quantityInWei = parseUnits(quantity.toString(), 18) // Standard 18 decimals for quantity

    // Generate quality standards based on export type
    const qualityStandards = getQualityStandards(exportType)

    writeContract({
      address: SMART_LOC_CONTRACT_ADDRESS,
      abi: SMART_LOC_ABI,
      functionName: 'createAgriculturalLoC',
      args: [
        exportType,
        quantityInWei,
        valueInWei,
        buyerCountry,
        buyerAddress as Address,
        deliveryTerms,
        qualityStandards
      ],
    })
  }

  // Fund Letter of Credit
  const fundLetterOfCredit = async (locId: number) => {
    if (!address) throw new Error('Wallet not connected')

    writeContract({
      address: SMART_LOC_CONTRACT_ADDRESS,
      abi: SMART_LOC_ABI,
      functionName: 'fundLoC',
      args: [BigInt(locId)],
    })
  }

  // Submit Quality Inspection
  const submitQualityInspection = async (locId: number, passed: boolean, certificateHash: string) => {
    if (!address) throw new Error('Wallet not connected')

    writeContract({
      address: SMART_LOC_CONTRACT_ADDRESS,
      abi: SMART_LOC_ABI,
      functionName: 'submitQualityInspection',
      args: [BigInt(locId), passed, certificateHash],
    })
  }

  // Confirm Shipment
  const confirmShipment = async (locId: number, trackingNumber: string) => {
    if (!address) throw new Error('Wallet not connected')

    writeContract({
      address: SMART_LOC_CONTRACT_ADDRESS,
      abi: SMART_LOC_ABI,
      functionName: 'confirmShipment',
      args: [BigInt(locId), trackingNumber],
    })
  }

  // Confirm Delivery
  const confirmDelivery = async (locId: number) => {
    if (!address) throw new Error('Wallet not connected')

    writeContract({
      address: SMART_LOC_CONTRACT_ADDRESS,
      abi: SMART_LOC_ABI,
      functionName: 'confirmDelivery',
      args: [BigInt(locId)],
    })
  }

  return {
    createAgriculturalLoC,
    fundLetterOfCredit,
    submitQualityInspection,
    confirmShipment,
    confirmDelivery,
    isWriting,
    isConfirming,
    isSuccess,
    hash,
  }
}

export function useLetterOfCreditDetails(locId: number) {
  const { data, isLoading, error } = useReadContract({
    address: SMART_LOC_CONTRACT_ADDRESS,
    abi: SMART_LOC_ABI,
    functionName: 'getLoC',
    args: [BigInt(locId)],
    query: {
      enabled: locId > 0,
    }
  })

  const statusMap = ['CREATED', 'FUNDED', 'INSPECTED', 'SHIPPED', 'DELIVERED', 'COMPLETED']

  const letterOfCredit: LetterOfCredit | null = data ? {
    id: Number(data[0]),
    exporter: data[1],
    buyer: data[2],
    exportType: data[3],
    quantity: formatUnits(data[4], 18),
    valueUSD: formatUnits(data[5], 6),
    status: statusMap[data[6]] || 'UNKNOWN',
    qualityInspected: data[7],
    shipped: data[8],
    delivered: data[9],
    createdAt: new Date(Number(data[10]) * 1000),
    qualityStandards: data[11]
  } : null

  return {
    letterOfCredit,
    isLoading,
    error
  }
}

export function useExporterLettersOfCredit(exporterAddress?: Address) {
  const { address } = useAccount()
  const targetAddress = exporterAddress || address

  const { data: locIds, isLoading } = useReadContract({
    address: SMART_LOC_CONTRACT_ADDRESS,
    abi: SMART_LOC_ABI,
    functionName: 'getExporterLoCs',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    }
  })

  // Convert BigInt array to number array
  const locIdNumbers = locIds ? locIds.map(id => Number(id)) : []

  return {
    locIds: locIdNumbers,
    isLoading
  }
}

// SGS Integration Hook
export function useSGSInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      locId: number
      exportType: string
      quantity: number
      qualityStandards: string
      exporterAddress: string
    }) => {
      // Mock SGS inspection - in real app would integrate with SGS API
      const inspectionResult = {
        id: `SGS-${Date.now()}`,
        locId: data.locId,
        inspectionDate: new Date().toISOString(),
        result: 'PASSED', // Mock result
        certificateHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        inspectorName: 'SGS Nigeria Ltd',
        qualityGrade: 'A',
        moistureContent: '7.2%',
        foreignMatter: '0.8%',
        defectivePercentage: '2.1%',
        overallRating: 'Premium Grade',
        certificateUrl: `https://sgs.com/certificates/SGS-${Date.now()}.pdf`
      }

      // Simulate inspection time
      await new Promise(resolve => setTimeout(resolve, 3000))

      return inspectionResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sgs-inspections'] })
    },
  })
}

// Get quality standards based on export type
function getQualityStandards(exportType: string): string {
  const standards: Record<string, string> = {
    'Cashew Nuts': 'W-320 Premium Grade, Moisture: Max 8%, Foreign Matter: Max 1%, Broken: Max 5%',
    'Cocoa Beans': 'Grade A Quality, Moisture: Max 7.5%, Bean Count: 100 beans/100g, Defective: Max 3%',
    'Sesame Seeds': 'Purity: Min 98%, Moisture: Max 6%, Oil Content: Min 50%, Foreign Matter: Max 2%',
    'Ginger': 'Moisture: Max 12%, Ash Content: Max 7%, Volatile Oil: Min 1.5%',
    'Hibiscus Flowers': 'Moisture: Max 12%, Foreign Matter: Max 2%, Color: Deep Red',
    'Shea Butter': 'Moisture: Max 0.05%, Free Fatty Acid: Max 3%, Iodine Value: 53-66',
    'Palm Oil': 'Free Fatty Acid: Max 5%, Moisture: Max 0.1%, Iodine Value: 50-55',
    'Yam': 'Moisture: Max 70%, Starch Content: Min 20%, No Pest Damage',
    'Cassava': 'Moisture: Max 14%, Starch Content: Min 25%, Cyanide: Max 10ppm'
  }

  return standards[exportType] || 'International export grade A quality standards'
}

// Mock inspection data
export function useInspectionHistory() {
  return useQuery({
    queryKey: ['sgs-inspections'],
    queryFn: async () => {
      // Mock inspection history
      return [
        {
          id: 'SGS-001',
          locId: 1,
          exportType: 'Cashew Nuts',
          result: 'PASSED',
          date: '2024-12-20',
          inspector: 'SGS Nigeria Ltd',
          certificateUrl: 'https://sgs.com/certificates/SGS-001.pdf'
        },
        {
          id: 'SGS-002',
          locId: 2,
          exportType: 'Cocoa Beans',
          result: 'PASSED',
          date: '2024-12-18',
          inspector: 'SGS Nigeria Ltd',
          certificateUrl: 'https://sgs.com/certificates/SGS-002.pdf'
        }
      ]
    },
  })
}

// Shipping integration hook
export function useShippingTracking() {
  return useMutation({
    mutationFn: async (data: {
      locId: number
      carrier: string
      trackingNumber: string
    }) => {
      // Mock shipping confirmation - in real app would integrate with DHL/FedEx APIs
      return {
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        status: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingUrl: `https://${data.carrier.toLowerCase()}.com/track/${data.trackingNumber}`
      }
    },
  })
}