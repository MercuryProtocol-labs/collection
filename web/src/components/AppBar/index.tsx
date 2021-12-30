import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const AppBar = () => {
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <WalletMultiButton></WalletMultiButton>Devnet
    </span>
  );
};
