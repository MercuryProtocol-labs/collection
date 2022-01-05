import { Spin } from 'antd';
import CollectionItem from '@/components/CollectionItem';
import styles from './index.less';
import { useMyCollections } from '@/hooks';

export default () => {
  const { collections, isLoading } = useMyCollections();

  return (
    <div>
      <div className={styles.content}>
        {isLoading && <Spin />}

        {collections && collections.map((data, index) => <CollectionItem key={data.pubkey.toString()} data={data} />)}
      </div>
    </div>
  );
};
