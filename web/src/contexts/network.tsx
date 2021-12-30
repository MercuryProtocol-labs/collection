import { createContext } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useLocalStorageState } from '@/hooks';

const DEFAULT_NETWORK = WalletAdapterNetwork.Devnet;

interface NetworkConfig {
  network: WalletAdapterNetwork;
  setNetwork: (val: string) => void;
}

export const NetworkContext = createContext<NetworkConfig>({
  network: DEFAULT_NETWORK,
  setNetwork: () => {},
});

export function NetworkProvider({ children = undefined as any }) {
  const [network, setNetwork] = useLocalStorageState('network', DEFAULT_NETWORK);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}
