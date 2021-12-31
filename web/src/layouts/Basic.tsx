import React, { FC, useMemo, useContext } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { useLocation } from 'umi';
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
import { Menu } from 'antd';
import BasicLayout from '@ant-design/pro-layout';
import { Link } from 'umi';
import { GithubOutlined, LogoutOutlined, ShoppingOutlined, HomeOutlined, ForkOutlined } from '@ant-design/icons';
import { AppBar } from '@/components/AppBar';
import { NetworkProvider, NetworkContext } from '@/contexts';

import styles from './index.less';
require('@solana/wallet-adapter-react-ui/styles.css');

// Default styles that can be overridden by your app

const Basic: FC = ({ children }) => {
  const { pathname } = useLocation();
  const { network } = useContext(NetworkContext);
  console.log('network: ', network);
  console.log('pathname: ', pathname);

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

  const theme = 'dark';

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BasicLayout
            title="McrCollection"
            navTheme={theme}
            headerTheme={theme}
            theme={theme}
            layout="mix"
            fixSiderbar={true}
            primaryColor="#d83aeb"
            logo={<div className="App-logo" />}
            rightContentRender={() => <AppBar />}
            links={[]}
            className={styles.layoutContent}
            menuContentRender={() => {
              return (
                <div className={styles.links}>
                  <Menu theme={theme} selectedKeys={[pathname]} mode="inline">
                    <Menu.Item key="/" icon={<HomeOutlined />}>
                      <Link to="/">Home</Link>
                    </Menu.Item>
                    <Menu.Item key="/collections" icon={<ShoppingOutlined />}>
                      <Link to="/collections">My Collections</Link>
                    </Menu.Item>
                    <Menu.Item key="/create" icon={<LogoutOutlined />}>
                      <Link to="/create">Create</Link>
                    </Menu.Item>
                  </Menu>

                  <Menu theme={theme} selectable={false} mode="inline" className={styles.bottomLinks}>
                    <Menu.Item key="16" icon={<ForkOutlined />}>
                      <a
                        title="Fork"
                        href="https://github.com/MercuryProtocol-labs/collection/fork"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Fork
                      </a>
                    </Menu.Item>
                    ,
                    <Menu.Item key="15" icon={<GithubOutlined />}>
                      <a
                        title="Gtihub"
                        href="https://github.com/MercuryProtocol-labs/collection/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Github
                      </a>
                    </Menu.Item>
                  </Menu>
                </div>
              );
            }}
          >
            {children}
          </BasicLayout>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WrapedBasic: FC = ({ children }) => {
  return (
    <NetworkProvider>
      <Basic>{children}</Basic>
    </NetworkProvider>
  );
};
export default WrapedBasic;
