import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'umi';
import { Button, Select, Input, message, Row, Col } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  addNFTToCollection,
  parseCollectionAccountData,
  getCollectionNFTs,
  starOnce,
  starMultiple,
  closeAccount,
} from '@boling/collection';
import { CollectionAccountData, CollectionInstructionType } from '@boling/collection';
import { PublicKey } from '@solana/web3.js';
import CollectionItem from '@/components/CollectionItem';
import NftItem from '@/components/ArtItem';
import { GUTTER } from '@/pages/home';
import { useMyNFTs } from '@/hooks';
import { ArtContent } from '@/components/ArtItem';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout } from '@solana/spl-token';

import styles from './index.less';

const { Option } = Select;

export default () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<(CollectionAccountData & { pubkey: PublicKey }) | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>(); // NFT mint address
  const [hasAuthority, setHasAuthority] = useState(false);
  const [starLoading, setStarLoading] = useState({
    once: false,
    hundred: false,
    thousand: false,
  });

  const { isLoading, list } = useMyNFTs();
  console.log('list: ', list);
  console.log(
    'myNFTs: ',
    list?.map((l) => l.data.mint),
  );

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

    const parsedData = parseCollectionAccountData({ pubkey, account });

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
      if (!tokenAddress) {
        message.error('Select your NFT');
        return;
      }
      if (!wallet || !wallet.publicKey) {
        message.error('Connect wallet please');
        return;
      }
      if (!wallet?.signTransaction) {
        message.error('Connect wallet please');

        return;
      }
      const mint = new PublicKey(tokenAddress);

      const [tokenAccountOfMint] = await PublicKey.findProgramAddress(
        [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      // const authority = new PublicKey('13K1aKvDBij4RA5Abe6rBLnCqMdHcGA4P1ygESsA5cwr');
      // const tokenAccountOfMint = new PublicKey('9zoR867KwGAsHjL9Lmc3Z8usgkJDnfYXixYdC17z1ZBG');

      const hash = await addNFTToCollection(
        connection,
        wallet.publicKey,
        new PublicKey(id),
        mint,
        tokenAccountOfMint,
        wallet.signTransaction,
      );
      console.log('hash: ', hash);
      location.reload();
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  }

  async function getNFTs() {
    try {
      const nfts = await getCollectionNFTs(connection, new PublicKey(id));
      console.log('nft: ', nfts);
      console.log(
        'nfts: ',
        nfts.map((n) => new PublicKey(n.mint).toString()),
      );

      setNfts(nfts);
    } catch (error: any) {
      console.error(error);
    }
  }

  async function handleStarsMultiple(type: CollectionInstructionType) {
    if (!collection) {
      return message.error('collection account error');
    }

    if (!wallet?.publicKey || !wallet.signTransaction) {
      return message.error('wallet not connected');
    }

    const key = type === CollectionInstructionType.LightUpStarsHundred ? 'hundred' : 'thousand';
    try {
      setStarLoading({
        ...starLoading,
        [key]: true,
      });
      const hash = await starMultiple(connection, wallet.publicKey, collection.pubkey, type, wallet.signTransaction);
      message.success(hash);
      location.reload();
    } catch (error) {
      console.error(error);
    }
    setStarLoading({
      ...starLoading,
      [key]: false,
    });
  }

  async function handleCloseAccount() {
    if (!collection) {
      return message.error('collection account error');
    }
    if (!wallet?.publicKey || !wallet.signTransaction) {
      return message.error('wallet not connected');
    }

    try {
      const hash = await closeAccount(
        connection,
        wallet.publicKey,
        collection?.pubkey,
        collection.account_type,
        wallet.signTransaction,
      );
      message.success(hash);
      history.go(-1);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleStartOnce() {
    if (!collection) {
      return message.error('collection account error');
    }
    if (!wallet?.publicKey || !wallet.signTransaction) {
      return message.error('wallet not connected');
    }

    try {
      setStarLoading({
        ...starLoading,
        once: true,
      });

      const hash = await starOnce(connection, wallet.publicKey, collection?.pubkey, wallet.signTransaction);

      message.success(hash);
      location.reload();
    } catch (error) {
      console.error(error);
    }
    setStarLoading({
      ...starLoading,
      once: false,
    });
  }

  function renderOptions(item: any) {
    const included = nfts.some((nft) => {
      return item.data.mint === new PublicKey(nft.mint).toString();
    });

    return (
      <Option key={item.pubkey.toString()} value={item.data.mint} disabled={included}>
        <span
          style={{
            display: 'inline-block',
            width: '25px',
            height: '25px',
            marginRight: '12px',
          }}
        >
          <ArtContent key={item.data.data.mint} uri={item.data.data.uri}></ArtContent>
        </span>
        <span>{item.data.data.name}</span>
      </Option>
    );
  }

  return (
    <div className={styles.content}>
      {!!collection && <CollectionItem data={collection} block></CollectionItem>}

      <div style={{ marginTop: '24px' }}>
        <Row gutter={GUTTER} className="home-info-row">
          <Col xs={24}>
            <Button
              loading={starLoading.once}
              size="large"
              block
              type="primary"
              onClick={handleStartOnce}
              icon={<LikeOutlined />}
            >
              +1 (free)
            </Button>
          </Col>

          <Col xs={12}>
            <Button
              size="large"
              block
              type="primary"
              icon={<LikeOutlined />}
              onClick={() => handleStarsMultiple(CollectionInstructionType.LightUpStarsHundred)}
              loading={starLoading.hundred}
            >
              +100 (0.01 SOL)
            </Button>
          </Col>
          <Col xs={12}>
            <Button
              size="large"
              block
              type="primary"
              icon={<LikeOutlined />}
              loading={starLoading.thousand}
              onClick={() => handleStarsMultiple(CollectionInstructionType.LightUpStarsThousand)}
            >
              +1000 (1 SOL)
            </Button>
          </Col>
        </Row>
      </div>

      {hasAuthority && (
        <>
          <div style={{ border: '3px solid #4e44ce', borderRadius: '16px', marginTop: '24px', padding: '48px 12px' }}>
            <div>
              {/* <Input size="large" placeholder="Token address" onChange={(e) => setTokenAddress(e.target.value)} /> */}
              <div>My NFTs:</div>
              <Select size="large" style={{ width: '100%' }} onChange={(val) => setTokenAddress(val as string)}>
                {list?.map((item) => renderOptions(item))}
              </Select>

              <Button size="large" type="primary" block onClick={addNFT} style={{ marginTop: '24px' }}>
                Add Token To The Collection
              </Button>
            </div>
          </div>

          {/* <div style={{ marginTop: '24px' }}>
            <Row gutter={GUTTER} className="home-info-row">
              <Col xs={24}>
                <Button size="large" block danger onClick={handleCloseAccount}>
                  Close The Collection
                </Button>
              </Col>
            </Row>
          </div> */}
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
