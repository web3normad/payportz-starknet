// lib/services/payslabContractService.ts
import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  getContract, 
  parseUnits, 
  formatUnits,
  Address,
  Hash,
  PublicClient,
  WalletClient
} from 'viem';
import { base } from 'viem/chains';
import { TradeData, Trade, ApiResponse, UserProfile } from '../../types';

// Contract addresses
const PAYSLAB_CONTRACT_ADDRESS = "0x0a6b4D9B6E3822349ed416bD3FBd42FD6F8F7f8C" as Address;
const FACTORY_CONTRACT_ADDRESS = "0x4293D1DF41b9440b54dB26Dd44770f3b4747ae49" as Address;
const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address; // Base USDC

// PaySlab Contract ABI (simplified)
const PAYSLAB_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_seller", "type": "address"},
      {"internalType": "uint256", "name": "_totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_deliveryDeadline", "type": "uint256"},
      {"internalType": "string", "name": "_qualityStandards", "type": "string"},
      {"internalType": "bool", "name": "_qualityInspectionRequired", "type": "bool"}
    ],
    "name": "createTrade",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tradeId", "type": "uint256"}],
    "name": "fundTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_bvn", "type": "string"}],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserProfile",
    "outputs": [
      {"internalType": "string", "name": "bvn", "type": "string"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "uint256", "name": "totalTrades", "type": "uint256"},
      {"internalType": "uint256", "name": "successfulTrades", "type": "uint256"},
      {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
      {"internalType": "uint256", "name": "joinedAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tradeId", "type": "uint256"}],
    "name": "getTrade",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "depositAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "shipmentAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "deliveryAmount", "type": "uint256"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint8", "name": "inspectionStatus", "type": "uint8"},
      {"internalType": "string", "name": "trackingNumber", "type": "string"},
      {"internalType": "string", "name": "qualityStandards", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "deliveryDeadline", "type": "uint256"},
      {"internalType": "bool", "name": "qualityInspectionRequired", "type": "bool"},
      {"internalType": "address", "name": "inspector", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

class PaySlabContractService {
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;
  private userAccount: Address | null = null;

  // Initialize clients and connect wallet
  async initialize(): Promise<ApiResponse<{ account: string }>> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Create public client for reading
        this.publicClient = createPublicClient({
          chain: base,
          transport: custom(window.ethereum)
        });

        // Create wallet client for writing
        this.walletClient = createWalletClient({
          chain: base,
          transport: custom(window.ethereum)
        });

        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        this.userAccount = accounts[0] as Address;
        
        // Switch to Base network if not already
        await this.switchToBaseNetwork();
        
        return { success: true, data: { account: this.userAccount } };
      } else {
        throw new Error('MetaMask not detected');
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Switch to Base network
  private async switchToBaseNetwork(): Promise<void> {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet chain ID
      });
    } catch (switchError: any) {
      // If Base network is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          }],
        });
      }
    }
  }

  // Verify user with BVN
  async verifyUser(bvn: string): Promise<ApiResponse<{ txHash: string }>> {
    try {
      if (!this.walletClient || !this.userAccount) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        client: { public: this.publicClient!, wallet: this.walletClient }
      });

      const hash = await contract.write.verifyUser([bvn], {
        account: this.userAccount,
        gas: 200000n
      });
      
      return { success: true, data: { txHash: hash } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get user profile
  async getUserProfile(address?: string): Promise<ApiResponse<UserProfile>> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not initialized');
      }

      const userAddress = (address || this.userAccount) as Address;
      if (!userAddress) {
        throw new Error('No user address provided');
      }

      const contract = getContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        client: this.publicClient
      });

      const profile = await contract.read.getUserProfile([userAddress]);
      
      return {
        success: true,
        data: {
          bvn: profile[0],
          isVerified: profile[1],
          totalTrades: Number(profile[2]),
          successfulTrades: Number(profile[3]),
          reputationScore: Number(profile[4]),
          joinedAt: new Date(Number(profile[5]) * 1000)
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get USDC balance
  async getUSDCBalance(address?: string): Promise<ApiResponse<{ balance: number }>> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not initialized');
      }

      const userAddress = (address || this.userAccount) as Address;
      if (!userAddress) {
        throw new Error('No user address provided');
      }

      const contract = getContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        client: this.publicClient
      });

      const balance = await contract.read.balanceOf([userAddress]);
      
      // USDC has 6 decimals
      const balanceInUSDC = formatUnits(balance, 6);
      
      return { success: true, data: { balance: parseFloat(balanceInUSDC) } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Create a new trade
  async createTrade(tradeData: TradeData): Promise<ApiResponse<{ tradeId: number; txHash: string }>> {
    try {
      if (!this.walletClient || !this.userAccount) {
        throw new Error('Wallet not connected');
      }

      const { sellerAddress, amount, deliveryDays, qualityStandards, requiresInspection } = tradeData;
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = parseUnits(amount.toString(), 6);
      
      // Calculate delivery deadline (current time + days)
      const deliveryDeadline = BigInt(Math.floor(Date.now() / 1000) + (deliveryDays * 24 * 60 * 60));

      const contract = getContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        client: { public: this.publicClient!, wallet: this.walletClient }
      });

      const hash = await contract.write.createTrade([
        sellerAddress as Address,
        amountInWei,
        deliveryDeadline,
        qualityStandards,
        requiresInspection
      ], {
        account: this.userAccount,
        gas: 300000n
      });

      // Wait for transaction receipt to get logs
      if (this.publicClient) {
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        // Extract trade ID from logs (you'd need to parse the logs based on your contract events)
        // For now, returning a placeholder trade ID
        const tradeId = 1; // This should be extracted from the event logs
        
        return { 
          success: true, 
          data: {
            tradeId,
            txHash: hash 
          }
        };
      }
      
      return { 
        success: true, 
        data: {
          tradeId: 1, // Placeholder
          txHash: hash 
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Fund a trade
  async fundTrade(tradeId: number, amount: number): Promise<ApiResponse<{ approveTxHash: string; fundTxHash: string }>> {
    try {
      if (!this.walletClient || !this.userAccount) {
        throw new Error('Wallet not connected');
      }

      // First approve USDC spending
      const amountInWei = parseUnits(amount.toString(), 6);
      
      const usdcContract = getContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        client: { public: this.publicClient!, wallet: this.walletClient }
      });

      const approveHash = await usdcContract.write.approve([
        PAYSLAB_CONTRACT_ADDRESS,
        amountInWei
      ], {
        account: this.userAccount,
        gas: 100000n
      });
      
      // Then fund the trade
      const payslabContract = getContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        client: { public: this.publicClient!, wallet: this.walletClient }
      });

      const fundHash = await payslabContract.write.fundTrade([BigInt(tradeId)], {
        account: this.userAccount,
        gas: 200000n
      });
      
      return { 
        success: true, 
        data: {
          approveTxHash: approveHash,
          fundTxHash: fundHash 
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get trade details
  async getTrade(tradeId: number): Promise<ApiResponse<Trade>> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not initialized');
      }

      const contract = getContract({
        address: PAYSLAB_CONTRACT_ADDRESS,
        abi: PAYSLAB_ABI,
        client: this.publicClient
      });

      const trade = await contract.read.getTrade([BigInt(tradeId)]);
      
      // Map status numbers to strings
      const statusMap = ['CREATED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'CANCELLED'];
      const inspectionMap = ['PENDING', 'PASSED', 'FAILED', 'NOT_REQUIRED'];
      
      return {
        success: true,
        data: {
          id: Number(trade[0]),
          buyer: trade[1],
          seller: trade[2],
          totalAmount: formatUnits(trade[3], 6),
          depositAmount: formatUnits(trade[4], 6),
          shipmentAmount: formatUnits(trade[5], 6),
          deliveryAmount: formatUnits(trade[6], 6),
          status: statusMap[trade[7]] as any,
          inspectionStatus: inspectionMap[trade[8]] as any,
          trackingNumber: trade[9],
          qualityStandards: trade[10],
          createdAt: new Date(Number(trade[11]) * 1000),
          deliveryDeadline: new Date(Number(trade[12]) * 1000),
          qualityInspectionRequired: trade[13],
          inspector: trade[14]
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get current account
  getCurrentAccount(): string | null {
    return this.userAccount;
  }

  // Check if user is connected
  isConnected(): boolean {
    return !!this.userAccount;
  }
}

export default PaySlabContractService;