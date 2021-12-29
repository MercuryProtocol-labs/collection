import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Space, Layout } from 'antd';
import Header from '@/layouts/Header';
import styles from './index.less';
require('@solana/wallet-adapter-react-ui/styles.css');

// Default styles that can be overridden by your app

const Basic: FC = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  console.log('network: ', network);

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network],
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Header></Header>

          <div style={{ width: '1080px', margin: '0 auto' }}>{children}</div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Basic;
