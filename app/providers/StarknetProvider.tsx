'use client';

import { StarknetConfig, publicProvider, argent, braavos } from '@starknet-react/core';
import { mainnet, sepolia } from '@starknet-react/chains';

interface StarknetProviderProps {
  children: React.ReactNode;
}

export default function StarknetProvider({ children }: StarknetProviderProps) {
  // Configure which Starknet chains to support
  const chains = [
    sepolia,  // Starknet Sepolia Testnet (for development)
    mainnet,  // Starknet Mainnet (for production)
  ];

  // Configure RPC provider
  const provider = publicProvider();

  // Configure wallet connectors using @starknet-react/core built-in connectors
  const connectors = [
    argent(),
    braavos(),
  ];

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}