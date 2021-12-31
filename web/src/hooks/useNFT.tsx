import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { programs } from '@metaplex/js';
const { Metadata } = programs.metadata;

const METADATA = 'metadata';
const metadata_program_id = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export function useMyNFTs() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [list, setList] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!wallet.publicKey) return;

      // Step 1: Call getTokenAccountsByOwner
      const { value: accounts } = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      // Step 2: Locate NFT Accounts
      const nftAccounts = accounts.filter((accountData) => {
        const { uiAmount, decimals } = accountData.account.data.parsed.info.tokenAmount;
        return uiAmount === 1 && decimals === 0;
      });

      /**
       * Step 3: Derive PDAs for the NFT accounts
       * metadataAccounts: PDA from NFT mint
       */
      const metadataAccountsPromise = nftAccounts.map((accountData) => {
        const mint = accountData.account.data.parsed.info.mint;

        return PublicKey.findProgramAddress(
          [Buffer.from(METADATA), new PublicKey(metadata_program_id).toBuffer(), new PublicKey(mint).toBuffer()],
          new PublicKey(metadata_program_id),
        );
      });

      const metadataAccounts = await Promise.all(metadataAccountsPromise);

      // just for debug
      // const metadataAccountsAddress = metadataAccounts.map(([pubkey]) => pubkey.toString());
      // console.log('metadataAccountsAddress: ', metadataAccountsAddress);

      // const metadataListPromise = metadataAccounts.map(([pubkey]) => Metadata.load(connection, pubkey));
      // const metadataList = await Promise.all(metadataListPromise);

      const metadataList = [];
      for (let i = 0; i < metadataAccounts.length; i++) {
        try {
          const metadata = await Metadata.load(connection, metadataAccounts[i][0]);
          metadataList.push(metadata);
        } catch (error) {
          console.error(error);
        }
      }

      setList(metadataList);
      setIsLoading(false);
    })();
  }, [wallet.publicKey]);

  return { isLoading, list };
}
