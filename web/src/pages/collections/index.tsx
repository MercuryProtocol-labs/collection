import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { getAllConnection } from '@/actions';
import { useConnection } from '@solana/wallet-adapter-react';
import CollectionItem from '@/components/CollectionItem';
import styles from './index.less';
import { PublicKey } from '@solana/web3.js';
import { useMyCollections } from '@/hooks';

export default () => {
  const { connection } = useConnection();
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
