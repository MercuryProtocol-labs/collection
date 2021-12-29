import { Space, Button } from 'antd';
import { Link, useHistory } from 'umi';
import { PublicKey } from '@solana/web3.js';
import { CollectionAccountData } from '@/models';
import styles from './index.less';

export default ({ data, hideView }: { data: CollectionAccountData & { pubkey: PublicKey }; hideView?: boolean }) => {
  const history = useHistory();
  return (
    <div className={styles.content}>
      <Space>
        <div className={styles.imageItem}>
          <span>banner</span> <img src={data.banaer} style={{ width: '100px' }} />
        </div>
        <div className={styles.imageItem}>
          <span>header_image:</span> <img src={data.header_image} style={{ width: '100px' }} />
        </div>
        <div className={styles.imageItem}>
          <span>icon_image:</span> <img src={data.icon_image} style={{ width: '100px' }} />
        </div>
      </Space>

      <div>title: {data.title}</div>
      <div>symbol: {data.symbol}</div>
      <div>account_type: {data.account_type.type}</div>
      <div>supply: {data.supply.toNumber()}</div>
      <div>description: {data.description}</div>
      <div>short_description: {data.short_description}</div>
      <div>tags: {data.tags?.join(', ')}</div>
      <div>authority: {new PublicKey(data.authority).toString()}</div>

      {!hideView && (
        <Button type="primary" block size="large" onClick={() => history.push(`/collection/${data.pubkey.toString()}`)}>
          View
        </Button>
      )}
    </div>
  );
};
