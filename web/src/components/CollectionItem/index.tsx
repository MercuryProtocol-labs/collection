import { Space, Button, Tag } from 'antd';
import { Link, useHistory } from 'umi';
import { PublicKey } from '@solana/web3.js';
import { CollectionAccountData } from '@/models';
import { shortAddress } from '@/utils';
import { LinkAddress } from '@/components/LinkAddress';
import classnames from 'classnames';
import styles from './index.less';

export default ({ data, block }: { data: CollectionAccountData & { pubkey: PublicKey }; block?: boolean }) => {
  const { title, symbol, supply, description, tags, authority, pubkey } = data;

  function renderImage() {
    if (block && data.banaer) {
      return <img src={data.banaer} />;
    }
    if (!block && data.header_image) {
      return <img src={data.header_image} />;
    }
    return null;
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
          <span style={{ marginLeft: 'auto', textAlign: 'right' }}>supply: {supply.toNumber()}</span>
        </span>

        <span>
          authority: <LinkAddress address={new PublicKey(authority).toString()} />
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
