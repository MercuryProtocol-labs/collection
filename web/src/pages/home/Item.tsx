import { Link } from 'umi';
import { CollectionAccountData } from '@boling/collection';
import { PublicKey } from '@solana/web3.js';
import styles from './index.less';
import { symbol } from 'prop-types';

type ItemDataProps = CollectionAccountData & { pubkey: PublicKey };
export default (props: { index: number; data: ItemDataProps }) => {
  const { index } = props;
  const { pubkey, title, icon_image, supply, stars, tags } = props.data;

  return (
    <Link to={`/collection/${pubkey.toString()}`}>
      <div className={styles.homeItem}>
        <div className={styles.homeItem1}>{index}</div>
        <div className={styles.homeItem1}>
          <span>
            <img src={icon_image} className={styles.iconImage} />
          </span>

          <span style={{ marginLeft: '12px' }}> {title}</span>
        </div>
        <div className={styles.homeItem1}>{tags?.join(', ')}</div>
        <div className={styles.homeItem1}>{supply.toNumber()}</div>
        <div className={styles.homeItem1}>{stars.toNumber()}</div>
      </div>
    </Link>
  );
};
