import { useState, useEffect } from 'react';
import { getAllConnection } from '@/actions';
import { useConnection } from '@solana/wallet-adapter-react';
import { CollectionAccountData } from '@/models';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export const useCollections = () => {
  const { connection } = useConnection();
  const [collections, setCollections] = useState<(CollectionAccountData & { pubkey: PublicKey })[] | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if (!connection) return;

      try {
        setIsLoading(true);

        const _collections = await getAllConnection(connection);
        console.log('collections:', _collections);
        setCollections(_collections);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, [connection]);

  return { collections, isLoading };
};

interface CollectionsCount {
  collections: number;
  supply: number;
  stars: number;
}
export const useCollectionsCount = () => {
  const [count, setCount] = useState<CollectionsCount>();
  const { collections } = useCollections();

  useEffect(() => {
    if (collections) {
      let supply = new BN(0);
      let stars = new BN(0);

      collections.forEach((collection) => {
        supply = collection.supply.add(supply);
        stars = collection.stars.add(stars);
      });

      setCount({
        collections: collections.length,
        supply: supply.toNumber(),
        stars: stars.toNumber(),
      });
    }
  }, [collections]);

  return count;
};
