import {
  Connection,
  PublicKey,
  Keypair,
  TransactionInstruction,
  Transaction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  sendAndConfirmRawTransaction,
  AccountInfo,
} from '@solana/web3.js';
import { serialize, deserializeUnchecked } from 'borsh';
import bs58 from 'bs58';
import {
  COLLECTION_ACCOUNT_DATA_SCHEMA,
  CollectionAccountData,
  CreateCollectionArgs,
  CREATE_COLLECTION_ARGS_SCHEMA,
  ACCOUNT_TYPE_SCHEMA,
  AccountType,
  CollectionIndexAccountData,
  COLLECTION_INDEX_ACCOUNT_DATA_SCHEMA,
} from '@/models';
import { WalletContextState } from '@solana/wallet-adapter-react';

// export const COLLECTION_PROGRAM_ID = new PublicKey('3c2kEHfoM9QXPJZxLvYGBkk3jncvtas8AoHFyRThbJA6');
export const COLLECTION_PROGRAM_ID = new PublicKey('co111CrRL738X8TKrqmLcNBstgLFZjuMtZRBW2FGpbC');

export function decodeCollectionAccountData({ pubkey, account }: { pubkey: PublicKey; account: AccountInfo<Buffer> }) {
  try {
    const data = deserializeUnchecked(COLLECTION_ACCOUNT_DATA_SCHEMA, CollectionAccountData, account.data);
    return { ...data, pubkey };
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
}

export async function getAllConnection(connection: Connection) {
  const collections = await connection.getProgramAccounts(COLLECTION_PROGRAM_ID, {
    encoding: 'base64',
    commitment: 'recent',
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: '2',
        },
      },
    ],
  });

  return collections.map(decodeCollectionAccountData);
}

export async function createCollection(connection: Connection, wallet: WalletContextState, args: CreateCollectionArgs) {
  if (!wallet?.publicKey || !wallet?.signTransaction) {
    throw new Error('wallet not connected');
  }

  console.log('args: ', args);

  const collectionDataU8 = serialize(CREATE_COLLECTION_ARGS_SCHEMA, args);

  const account = new Keypair();
  const instruction = new TransactionInstruction({
    data: Buffer.from(collectionDataU8),
    keys: [
      { isSigner: true, isWritable: true, pubkey: account.publicKey },
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({ feePayer: wallet.publicKey });
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  transaction.sign(account);
  const signedTransaction = await wallet.signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return { hash, pubkey: account.publicKey };
}

export async function addNFTToCollection(
  connection: Connection,
  wallet: WalletContextState,
  collectionAccount: PublicKey,
  mint: PublicKey,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('wallet not connected');
  }

  const dataU8 = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({ type: 1 }));
  const [indexAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('collection'), COLLECTION_PROGRAM_ID.toBytes(), mint.toBytes()],
    COLLECTION_PROGRAM_ID,
  );

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataU8),
    keys: [
      { isSigner: false, isWritable: true, pubkey: collectionAccount },
      { isSigner: false, isWritable: false, pubkey: mint },
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: true, pubkey: indexAccount },
      { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({ feePayer: wallet.publicKey });
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await wallet.signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

class QueryCollectionNFTsParams {
  type: number;
  collection: PublicKey;

  constructor(args: { type: number; collection: PublicKey }) {
    this.type = args.type;
    this.collection = args.collection;
  }
}
const QUERY_COLLECTION_NFTS_PARAMS_SCHEMA = new Map<any, any>([
  [
    PublicKey,
    {
      kind: 'struct',
      fields: [['']],
    },
  ],
  [
    QueryCollectionNFTsParams,
    {
      kind: 'struct',
      fields: [
        ['type', 'u8'],
        ['collection', PublicKey],
      ],
    },
  ],
]);
export async function getCollectionNFTs(connection: Connection, collection: PublicKey) {
  const args = new QueryCollectionNFTsParams({
    type: 2,
    collection,
  });

  const bytes1 = collection.toBytes();
  const arr1 = Array.from(bytes1);
  arr1.unshift(2);
  const bytes2 = Buffer.from(arr1);

  // const paramsU8 = serialize(QUERY_COLLECTION_NFTS_PARAMS_SCHEMA, args);
  // console.log('paramsU8: ', paramsU8);
  // const bytes = Buffer.from(paramsU8);
  const bs58Str = bs58.encode(bytes2);

  const accounts = await connection.getProgramAccounts(COLLECTION_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58Str,
        },
      },
    ],
  });

  let nfts = [];
  if (accounts && accounts.length) {
    nfts = accounts.map((account) =>
      deserializeUnchecked(COLLECTION_INDEX_ACCOUNT_DATA_SCHEMA, CollectionIndexAccountData, account.account.data),
    );
  }

  return nfts;
}
