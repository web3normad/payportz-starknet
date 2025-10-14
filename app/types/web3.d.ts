import { Contract, providers } from 'ethers';

export interface Web3ContextType {
  account: string | null;
  contract: Contract | null;
  provider: providers.Web3Provider | null;
  connectWallet: () => Promise<void>;
}