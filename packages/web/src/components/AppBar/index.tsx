import { useContext } from 'react';
import { Popover, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NetworkContext } from '@/contexts';
import { Settings } from '@/components/Settings';

export const AppBar = () => {
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <WalletMultiButton></WalletMultiButton>

      <Popover placement="topRight" title="Setting" content={<Settings />} trigger="click">
        <Button shape="circle" size="large" type="text" icon={<SettingOutlined />} />
      </Popover>
    </span>
  );
};
