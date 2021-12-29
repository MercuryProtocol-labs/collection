import { Spin, Empty } from 'antd';
import CollectionItem from '@/components/CollectionItem';
import styles from './index.less';
import { useMyCollections } from '@/hooks';

export default () => {
  const { collections, isLoading } = useMyCollections();

  return (
    <div className={styles.content}>
      {isLoading ? (
        <Spin />
      ) : !collections || !collections.length ? (
        <div className={styles.wrapEmpty}>
          <Empty />
        </div>
      ) : null}

      {collections && collections.map((data, index) => <CollectionItem key={data.pubkey.toString()} data={data} />)}
    </div>
  );
};
