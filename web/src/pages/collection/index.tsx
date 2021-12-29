import { useEffect, useState } from 'react';
import { useParams } from 'umi';
import { Button, Card, Input, message, PageHeader, Empty } from 'antd';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { addNFTToCollection, decodeCollectionAccountData, getCollectionNFTs } from '@/actions';
import { CollectionAccountData } from '@/models';
import { PublicKey } from '@solana/web3.js';
import CollectionItem from '@/components/CollectionItem';
import NftItem from '@/components/ArtItem';
import styles from './index.less';

export default () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<(CollectionAccountData & { pubkey: PublicKey }) | null>(null);
  const [tokenAddress, setTokenAddress] = useState(''); // NFT mint address
  const [hasAuthority, setHasAuthority] = useState(false);

  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    getCollectionAccountData();
    getNFTs();
  }, [id]);

  useEffect(() => {
    initAuthority();
  }, [collection, wallet]);

  async function getCollectionAccountData() {
    const pubkey = new PublicKey(id);
    const account = await connection.getAccountInfo(pubkey);
    if (!account) return;

    const parsedData = decodeCollectionAccountData({ pubkey, account });

    setCollection(parsedData);
  }

  function initAuthority() {
    if (!collection || !wallet.publicKey) return;

    const authorityAddr = new PublicKey(collection.authority).toString().toLocaleLowerCase();
    const walletAddr = wallet.publicKey?.toString().toLocaleLowerCase();

    setHasAuthority(authorityAddr === walletAddr);
  }

  async function addNFT() {
    try {
      const mint = new PublicKey(tokenAddress);

      const hash = await addNFTToCollection(connection, wallet, new PublicKey(id), mint);
      console.log('hash: ', hash);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  }

  async function getNFTs() {
    try {
      const nfts = await getCollectionNFTs(connection, new PublicKey(id));

      setNfts(nfts);
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <div className={styles.content}>
      {!!collection && <CollectionItem data={collection} block></CollectionItem>}

      {hasAuthority && (
        <div style={{ marginTop: '24px' }}>
          <Input size="large" placeholder="Token address" onChange={(e) => setTokenAddress(e.target.value)} />
          <Button size="large" type="primary" block onClick={addNFT} style={{ marginTop: '24px' }}>
            Add Token To The Collection
          </Button>
        </div>
      )}

      <div className={styles.wrapNfts}>
        {nfts.map((nft) => (
          <NftItem key={new PublicKey(nft.mint).toString()} nft={nft} />
        ))}
      </div>
    </div>
  );
};
