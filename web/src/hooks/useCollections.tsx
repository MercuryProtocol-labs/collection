import { useState, useEffect } from 'react';
import { getAllConnection, getMyConnections, getTreasuryBalance } from '@/actions';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { CollectionAccountData } from '@/models';
import BN from 'bn.js';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

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

        setCollections(_collections);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, [connection]);

  return { collections, isLoading };
};

export const useMyCollections = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [collections, setCollections] = useState<(CollectionAccountData & { pubkey: PublicKey })[] | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if (!connection || !wallet.publicKey) return;

      try {
        setIsLoading(true);

        const _collections = await getMyConnections(connection, wallet);

        setCollections(_collections);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, [connection, wallet.publicKey?.toBase58()]);

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

export const useTreasuryBalance = () => {
  const { connection } = useConnection();
  const [balance, setBalance] = useState({
    amount: 0,
    uiAmount: 0,
  });

  useEffect(() => {
    (async () => {
      const val = await getTreasuryBalance(connection);
      setBalance({
        amount: val,
        uiAmount: val / LAMPORTS_PER_SOL,
      });
    })();
  }, [connection]);

  return balance;
};
