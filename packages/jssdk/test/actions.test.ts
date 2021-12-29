import {expect} from 'chai';
import {clusterApiUrl, Connection, PublicKey, AccountInfo, LAMPORTS_PER_SOL, Keypair} from '@solana/web3.js';

import {
  COLLECTION_PROGRAM_ID,
  getTreasuryProgram,
  parseCollectionAccountData,
  getTreasuryBalance,
  getAccountCollections,
  getCollections,
  getCollectionNFTs,
} from '../src';

// a user account
const secretKey = Uint8Array.from([
  22, 50, 131, 39, 211, 178, 154, 234, 49, 23, 226, 96, 171, 206, 87, 21, 187, 47, 128, 190, 48, 70, 124, 112, 77, 197,
  232, 213, 120, 55, 15, 107, 142, 191, 126, 162, 3, 130, 178, 51, 158, 120, 0, 74, 249, 110, 203, 227, 84, 171, 55, 32,
  224, 212, 200, 193, 246, 101, 47, 209, 221, 144, 215, 102,
]);
const keypair = Keypair.fromSecretKey(secretKey);

const collection = new PublicKey('Ht36NhfTf5xLjv9oWCwBxR5uuQcttKpuQZyo9CkLtjdD');

describe('Collection', () => {
  const connection = new Connection(clusterApiUrl('devnet'));

  it('COLLECTION_PROGRAM_ID', () => {
    expect(COLLECTION_PROGRAM_ID.toString()).to.eq('co111CrRL738X8TKrqmLcNBstgLFZjuMtZRBW2FGpbC');
  });

  it('parseCollectionAccountData', async () => {
    const pubkey = new PublicKey('2t5pKYBev8RnjEku7GX1Ds1uKNBb5W7w94CuT7yVS4Kr');
    const account = await connection.getAccountInfo(pubkey);

    expect(account).to.not.a('null');

    const parsedData = parseCollectionAccountData({pubkey, account} as {
      pubkey: PublicKey;
      account: AccountInfo<Buffer>;
    });

    expect(parsedData.pubkey.toBase58()).to.eq(pubkey.toBase58());
    expect(parsedData.title).to.eq(`Shiba's Herd`);
  });

  it('getTreasuryProgram', async () => {
    const treasuryProgram = await getTreasuryProgram();

    expect(treasuryProgram.toString()).to.eq('D7mQZksqLfqofKep2NH4XpY6hnSzTL5rxtxe3Wwvzf3s');
  });

  it('getTreasuryBalance', async () => {
    const {balance, uiBalance} = await getTreasuryBalance(connection);

    expect(balance).to.a('number');
    expect(uiBalance).to.eq(balance / LAMPORTS_PER_SOL);
  });

  it('getAccountCollections', async () => {
    const account = keypair.publicKey;
    const list = await getAccountCollections(connection, account);

    expect(list).to.an('array');
  });

  it('getCollections', async () => {
    const list = await getCollections(connection);

    expect(list.length).to.be.above(0);
  });

  it('getCollectionNFTs', async () => {
    const nfts = await getCollectionNFTs(connection, collection);

    expect(nfts.length).to.be.above(0);
  });
});
