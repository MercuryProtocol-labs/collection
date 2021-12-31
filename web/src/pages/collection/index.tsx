import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'umi';
import { Button, Card, Input, message, Row, Col } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { addNFTToCollection, decodeCollectionAccountData, getCollectionNFTs } from '@/actions';
import { CollectionAccountData, CollectionInstructionType } from '@/models';
import { PublicKey } from '@solana/web3.js';
import CollectionItem from '@/components/CollectionItem';
import NftItem from '@/components/ArtItem';
import { GUTTER } from '@/pages/home';
import { starMultiple, AccountTypes, closeAccount } from '@/actions';

import styles from './index.less';

export default () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<(CollectionAccountData & { pubkey: PublicKey }) | null>(null);
  const [tokenAddress, setTokenAddress] = useState(''); // NFT mint address
  const [hasAuthority, setHasAuthority] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  const [nfts, setNfts] = useState<any[]>([]);

  console.log('collection: ', collection);

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

  async function handleStarsMultiple(type: CollectionInstructionType) {
    if (!collection) {
      return message.error('collection account error');
    }

    console.log('insType: ', type);
    try {
      setStarLoading(true);
      const hash = await starMultiple(connection, wallet, collection.pubkey, type);
      message.success(hash);
    } catch (error) {
      console.error(error);
    }
    setStarLoading(false);
  }

  async function handleCloseAccount() {
    if (!collection) {
      return message.error('collection account error');
    }

    try {
      const hash = await closeAccount(connection, wallet, collection?.pubkey, collection.account_type);
      message.success(hash);
      history.go(-1);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.content}>
      {!!collection && <CollectionItem data={collection} block></CollectionItem>}

      <div style={{ marginTop: '24px' }}>
        <Row gutter={GUTTER} className="home-info-row">
          <Col xs={12}>
            <Button
              size="large"
              block
              type="primary"
              icon={<LikeOutlined />}
              onClick={() => handleStarsMultiple(CollectionInstructionType.LightUpStarsHundred)}
              loading={starLoading}
            >
              +100
            </Button>
          </Col>
          <Col xs={12}>
            <Button
              size="large"
              block
              type="primary"
              icon={<LikeOutlined />}
              loading={starLoading}
              onClick={() => handleStarsMultiple(CollectionInstructionType.LightUpStarsThousand)}
            >
              +1000
            </Button>
          </Col>
        </Row>
      </div>

      {hasAuthority && (
        <>
          <div style={{ border: '3px solid #4e44ce', borderRadius: '16px', marginTop: '24px', padding: '48px 12px' }}>
            <div>
              <Input size="large" placeholder="Token address" onChange={(e) => setTokenAddress(e.target.value)} />
              <Button size="large" type="primary" block onClick={addNFT} style={{ marginTop: '24px' }}>
                Add Token To The Collection
              </Button>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Row gutter={GUTTER} className="home-info-row">
              <Col xs={24}>
                <Button size="large" block danger onClick={handleCloseAccount}>
                  Close The Collection
                </Button>
              </Col>
            </Row>
          </div>
        </>
      )}

      <div className={styles.wrapNfts}>
        {nfts.map((nft) => (
          <NftItem key={new PublicKey(nft.mint).toString()} nft={nft} />
        ))}
      </div>
    </div>
  );
};
