import { FC, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getMetadata } from '@/actions';
import { useUriToArt } from '@/hooks';
import { CollectionIndexAccountData } from '@/models';

// only image
const ArtContent: FC<{ uri: string }> = ({ uri }) => {
  const { artUrl, isLoading } = useUriToArt(uri);

  if (!uri) return null;

  return (
    <span>
      {isLoading && <Spin />}
      <img src={artUrl} alt="" />
    </span>
  );
};

export default ({ nft }: { nft: CollectionIndexAccountData }) => {
  const { connection } = useConnection();
  const [art, setArt] = useState<any>(null);

  useEffect(() => {
    async function query() {
      const metadata = await getMetadata(connection, new PublicKey(nft.mint));

      setArt({
        ...metadata?.data.data,
        pubkey: metadata?.pubkey,
      });
    }

    query();
  }, [connection]);

  if (!art) return null;

  return (
    <div>
      <div>index: {nft.index.toNumber()}</div>
      <div>name: {art.name}</div>
      <div>symbol: {art.symbol}</div>
      <div>pubkey: {art.pubkey.toString()}</div>
      <div>
        uri:{' '}
        <a href={art.uri} target="_blank">
          {art.uri}
        </a>
      </div>
      <div>
        <ArtContent uri={art.uri}></ArtContent>
      </div>
    </div>
  );
};
