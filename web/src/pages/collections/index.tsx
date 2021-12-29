import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { getAllConnection } from '@/actions';
import { useConnection } from '@solana/wallet-adapter-react';
import CollectionItem from '@/components/CollectionItem';
import styles from './index.less';

export default () => {
  const { connection } = useConnection();
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllCollection();
  }, []);

  async function getAllCollection() {
    try {
      setIsLoading(true);

      const _collections = await getAllConnection(connection);
      console.log('collections:', _collections);
      setCollections(_collections);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className={styles.content}>
        {isLoading && <Spin />}

        {collections.map((data, index) => (
          <CollectionItem key={data.pubkey.toString()} data={data} />
        ))}
      </div>
    </div>
  );
};
