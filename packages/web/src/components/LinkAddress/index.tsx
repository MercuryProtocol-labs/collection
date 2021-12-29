import { FC } from 'react';
import { shortAddress } from '@/utils';
import { useNetwork } from '@/contexts';

export const LinkAddress: FC<{ address: string }> = ({ address }) => {
  const { network } = useNetwork();

  return (
    <a href={`https://explorer.solana.com/address/${address}?cluster=${network}`} target="_blank">
      {shortAddress(address)}
    </a>
  );
};
