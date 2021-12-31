import { FC, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { getMetadata } from '@/actions';
import { useUriToArt } from '@/hooks';
import { CollectionIndexAccountData } from '@/models';
import styles from './index.less';

// only image
export const ArtContent: FC<{ uri: string }> = ({ uri }) => {
  const { artUrl, isLoading } = useUriToArt(uri);

  if (!uri) return null;

  return (
    <>
      {isLoading && <Spin />}
      {artUrl && <img src={artUrl} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
    </>
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
    <div className={styles.artItem}>
      <div className={styles.wrapArt}>
        <a
          href={`https://explorer.solana.com/address/${new PublicKey(nft.mint).toString()}?cluster=devnet`}
          target="_blank"
        >
          <ArtContent uri={art.uri}></ArtContent>
        </a>
      </div>

      <div className={styles.name}>
        {art.name} #{nft.index.toNumber()}
      </div>
    </div>
  );
};
