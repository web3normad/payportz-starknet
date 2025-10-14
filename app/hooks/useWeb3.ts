// hooks/useWeb3.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { base } from 'viem/chains';
import PaySlabContractService from '../lib/services/payslabContractService';

interface UserInfo {
  id: string;
  email?: string;
  wallet?: string;
  createdAt: Date;
  linkedAccounts: any[];
}

interface Web3ContextType {
  // Privy authentication state
  authenticated: boolean;
  ready: boolean;
  user: UserInfo | null;
  
  // Wallet state
  account: string | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  balance: number;
  
  // Contract service
  web3Service: PaySlabContractService;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  login: () => void;
  logout: () => void;
  updateBalance: () => Promise<void>;
  switchToBase: () => Promise<void>;
  
  // Account linking
  linkEmail: () => void;
  linkWallet: () => void;
  unlinkEmail: (email: string) => void;
  unlinkWallet: (address: string) => void;
  
  // Utilities
  isCorrectNetwork: () => boolean;
  formatAddress: (address?: string) => string;
}

// Create context with null as default value
const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const { 
    login, 
    logout, 
    authenticated, 
    user, 
    ready,
    connectWallet,
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet
  } = usePrivy();
  
  const { wallets } = useWallets();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Get USDC balance on Base
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    chainId: base.id,
    query: {
      enabled: !!address && isConnected
    }
  });

  // Contract service instance
  const contractService = new PaySlabContractService();

  const connectWalletHandler = async (): Promise<void> => {
    try {
      if (!authenticated) {
        // If not authenticated, login first
        login();
      } else {
        // If authenticated but no wallet, connect wallet
        await connectWallet();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      logout();
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  };

  const switchToBase = async (): Promise<void> => {
    try {
      if (wallets[0]) {
        await wallets[0].switchChain(base.id);
      } else if (switchChain) {
        await switchChain({ chainId: base.id });
      }
    } catch (error) {
      console.error('Network switch failed:', error);
      throw error;
    }
  };

  const isCorrectNetwork = (): boolean => {
    return chain?.id === base.id;
  };

  const formatAddress = (addr?: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const updateBalance = async (): Promise<void> => {
    if (isConnected) {
      await refetchBalance();
    }
  };

  // Get user info
  const getUserInfo = (): UserInfo | null => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email?.address,
      wallet: user.wallet?.address,
      createdAt: user.createdAt,
      linkedAccounts: user.linkedAccounts || []
    };
  };

  const value: Web3ContextType = {
    // Privy authentication state
    authenticated,
    ready,
    user: getUserInfo(),
    
    // Wallet state
    account: address,
    isConnected: authenticated && isConnected,
    chainId: chain?.id,
    balance: balance ? parseFloat(balance.formatted) : 0,
    
    // Contract service
    web3Service: contractService,
    
    // Actions
    connectWallet: connectWalletHandler,
    disconnectWallet,
    login,
    logout,
    updateBalance,
    switchToBase,
    
    // Account linking
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet,
    
    // Utilities
    isCorrectNetwork,
    formatAddress
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};