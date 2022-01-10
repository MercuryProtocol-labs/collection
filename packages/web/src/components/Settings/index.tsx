import React, { useContext } from 'react';
import { Button, Select } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkContext } from '@/contexts';

const NETWORKS = ['mainnet-beta', 'devnet'];
export const Settings = () => {
  const { connected, disconnect } = useWallet();
  const { network, setNetwork } = useContext(NetworkContext);

  return (
    <>
      <div style={{ display: 'grid' }}>
        Network:
        <Select onSelect={(val) => setNetwork(val as string)} value={network} style={{ marginBottom: 20 }}>
          {NETWORKS.map((name) => (
            <Select.Option value={name} key={name}>
              {name}
            </Select.Option>
          ))}
        </Select>
        {connected && (
          <Button type="primary" onClick={disconnect}>
            Disconnect
          </Button>
        )}
      </div>
    </>
  );
};
