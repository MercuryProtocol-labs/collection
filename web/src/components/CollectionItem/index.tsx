import { Link } from 'umi';
import { message } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CollectionAccountData } from '@/models';
import { LinkAddress } from '@/components/LinkAddress';
import { starOnce } from '@/actions';
import classnames from 'classnames';
import styles from './index.less';

export default ({ data, block }: { data: CollectionAccountData & { pubkey: PublicKey }; block?: boolean }) => {
  const { title, symbol, supply, description, tags, authority, pubkey, stars } = data;
  const { connection } = useConnection();
  const wallet = useWallet();

  function renderImage() {
    if (block && data.banaer) {
      return <img src={data.banaer} />;
    }
    if (!block && data.header_image) {
      return <img src={data.header_image} />;
    }
    return null;
  }

  async function handleStar() {
    console.log('handle star');
    try {
      const hash = await starOnce(connection, wallet, pubkey);
      message.success(hash);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={classnames(styles.collectionItem, { [styles.collectionItemBlock]: block })}>
      <div className={styles.images}>
        <Link to={`/collection/${pubkey.toString()}`}>
          <div className={styles.headerImage}>{renderImage()}</div>

          <img src={data.icon_image} className={styles.iconImage} />
        </Link>
      </div>

      <div className={styles.descriptions}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>

      <div className={styles.infos}>
        <span style={{ display: 'flex' }}>
          <span>symbol: {symbol}</span>
          <span style={{ marginLeft: 'auto', textAlign: 'right' }}>items: {supply.toNumber()}</span>
        </span>

        <span style={{ display: 'flex' }}>
          <span>
            authority: <LinkAddress address={new PublicKey(authority).toString()} />
          </span>
          <span style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <a onClick={handleStar}>
              <LikeOutlined style={{ fontSize: 18 }} /> {stars.toNumber()}
            </a>
          </span>
        </span>

        <span>
          tags:{' '}
          {tags?.map((tag) => (
            <span key={tag}>{tag} </span>
          ))}
        </span>
      </div>
    </div>
  );
};
