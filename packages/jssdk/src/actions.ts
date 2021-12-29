import {
  PublicKey,
  Connection,
  Keypair,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  sendAndConfirmRawTransaction,
  LAMPORTS_PER_SOL,
  AccountInfo,
} from '@solana/web3.js';
import bs58 from 'bs58';
import {serialize, deserializeUnchecked} from 'borsh';

import {COLLECTION_PROGRAM_ID} from './ids';
import {
  CREATE_COLLECTION_ARGS_SCHEMA,
  CreateCollectionArgs,
  COLLECTION_ACCOUNT_DATA_SCHEMA,
  CollectionAccountData,
  ACCOUNT_TYPE_SCHEMA,
  AccountType,
  COLLECTION_INDEX_ACCOUNT_DATA_SCHEMA,
  CollectionIndexAccountData,
  CLOSE_ACCOUNT_INSTRUCTION_ARGS_SCHEMA,
  CloseAccountInstructionArgs,
  CollectionInstructionType,
} from './models';

export type SignTransaction = (transaction: Transaction) => Promise<Transaction>;

export function parseCollectionAccountData(collection: {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
}): CollectionAccountData & {pubkey: PublicKey} {
  const data = deserializeUnchecked(COLLECTION_ACCOUNT_DATA_SCHEMA, CollectionAccountData, collection.account.data);
  return {
    ...data,
    pubkey: collection.pubkey,
  };
}

export async function getTreasuryProgram() {
  const [treasuryPubkey] = await PublicKey.findProgramAddress(
    [Buffer.from('collection'), Buffer.from('treasury'), COLLECTION_PROGRAM_ID.toBytes()],
    COLLECTION_PROGRAM_ID,
  );

  return treasuryPubkey;
}

export async function getTreasuryBalance(connection: Connection) {
  const treasury = await getTreasuryProgram();
  const balance = await connection.getBalance(treasury);
  return {
    balance,
    uiBalance: balance / LAMPORTS_PER_SOL,
  };
}

export async function createCollection(
  connection: Connection,
  authority: PublicKey,
  args: CreateCollectionArgs,
  signTransaction: SignTransaction,
) {
  const collectionDataU8 = serialize(CREATE_COLLECTION_ARGS_SCHEMA, args);

  const account = new Keypair();
  const instruction = new TransactionInstruction({
    data: Buffer.from(collectionDataU8),
    keys: [
      {isSigner: true, isWritable: true, pubkey: account.publicKey},
      {isSigner: true, isWritable: false, pubkey: authority},
      {isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY},
      {isSigner: false, isWritable: false, pubkey: SystemProgram.programId},
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({feePayer: authority});
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  transaction.sign(account);
  const signedTransaction = await signTransaction(transaction);

  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return {hash, pubkey: account.publicKey};
}

export async function getAccountCollections(connection: Connection, account: PublicKey) {
  const accountType = Buffer.from([1]);
  const buf = Buffer.concat([accountType, account.toBytes()], 33);
  const bytes = bs58.encode(buf);

  const collections = await connection.getProgramAccounts(COLLECTION_PROGRAM_ID, {
    encoding: 'base64',
    commitment: 'recent',
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bytes,
        },
      },
    ],
  });

  return collections.map(parseCollectionAccountData);
}

export async function getCollections(connection: Connection) {
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

  return collections.map(parseCollectionAccountData);
}

export async function addNFTToCollection(
  connection: Connection,
  authority: PublicKey,
  collection: PublicKey,
  mint: PublicKey,
  tokenAccountOfMint: PublicKey,
  signTransaction: SignTransaction,
) {
  const dataArr = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({type: 1}));
  const [indexAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('collection'), COLLECTION_PROGRAM_ID.toBytes(), mint.toBytes()],
    COLLECTION_PROGRAM_ID,
  );

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataArr),
    keys: [
      {isSigner: false, isWritable: true, pubkey: collection}, // 0. `[writeable]` Collcection account
      {isSigner: true, isWritable: false, pubkey: authority}, // 1. `[signer]` Authority of collection account
      {isSigner: false, isWritable: false, pubkey: mint}, // 2. `[]` Mint of token asset (supply must be 1)
      {isSigner: false, isWritable: false, pubkey: tokenAccountOfMint}, // 3. `[]` Token account of mint (amount must be 1)
      {isSigner: false, isWritable: true, pubkey: indexAccount}, // 4. `[writable]`  Collection index account (pda of ['collection', program id, mint id])
      {isSigner: true, isWritable: false, pubkey: authority}, // 5. `[signer]` Funding account (must be a system account)
      {isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY}, // 6. `[]` Rent info
      {isSigner: false, isWritable: false, pubkey: SystemProgram.programId}, // 7. `[]` System program id account
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({feePayer: authority});
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

export async function getCollectionNFTs(connection: Connection, collection: PublicKey) {
  const accountType = Buffer.from([2]); // accountType
  const buf = Buffer.concat([accountType, collection.toBytes()], 33);
  const bufToBs58 = bs58.encode(buf);

  const accounts = await connection.getProgramAccounts(COLLECTION_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bufToBs58,
        },
      },
    ],
  });

  let nfts: CollectionIndexAccountData[] = [];
  if (accounts && accounts.length) {
    nfts = accounts.map(account =>
      deserializeUnchecked(COLLECTION_INDEX_ACCOUNT_DATA_SCHEMA, CollectionIndexAccountData, account.account.data),
    );
  }

  return nfts;
}

export async function closeAccount(
  connection: Connection,
  authority: PublicKey,
  collection: PublicKey,
  signTransaction: SignTransaction,
) {
  const dataArr = serialize(CLOSE_ACCOUNT_INSTRUCTION_ARGS_SCHEMA, new CloseAccountInstructionArgs());

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataArr),
    keys: [
      {isSigner: false, isWritable: true, pubkey: collection},
      {isSigner: false, isWritable: true, pubkey: authority},
      {isSigner: true, isWritable: false, pubkey: authority},
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({feePayer: authority});
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

export async function starOnce(
  connection: Connection,
  feePayer: PublicKey,
  collection: PublicKey,
  signTransaction: SignTransaction,
) {
  const dataArr = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({type: CollectionInstructionType.LightUpStarsOnce}));

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataArr),
    keys: [{isSigner: false, isWritable: true, pubkey: collection}],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({feePayer});
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

export async function starMultiple(
  connection: Connection,
  feePayer: PublicKey,
  collection: PublicKey,
  instructionType: CollectionInstructionType.LightUpStarsHundred | CollectionInstructionType.LightUpStarsThousand,
  signTransaction: SignTransaction,
) {
  const treasuryAccount = await getTreasuryProgram();
  const dataArr = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({type: instructionType}));

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataArr),
    keys: [
      {isSigner: false, isWritable: true, pubkey: collection},
      {isSigner: true, isWritable: false, pubkey: feePayer},
      {isSigner: false, isWritable: true, pubkey: treasuryAccount},
      {isSigner: false, isWritable: false, pubkey: SystemProgram.programId},
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({feePayer: feePayer});
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}
