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
  CloseAccountInstructionArgs,
  CollectionInstructionType,
  CLOSE_ACCOUNT_INSTRUCTION_ARGS_SCHEMA,
} from '@/models';
import { WalletContextState } from '@solana/wallet-adapter-react';

// export const COLLECTION_PROGRAM_ID = new PublicKey('3c2kEHfoM9QXPJZxLvYGBkk3jncvtas8AoHFyRThbJA6');
export const COLLECTION_PROGRAM_ID = new PublicKey('co111CrRL738X8TKrqmLcNBstgLFZjuMtZRBW2FGpbC');

export async function getTreasuryProgram() {
  const [treasuryPubkey] = await PublicKey.findProgramAddress(
    [Buffer.from('collection'), Buffer.from('treasury'), COLLECTION_PROGRAM_ID.toBytes()],
    COLLECTION_PROGRAM_ID,
  );

  return treasuryPubkey;
}

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

export async function getMyConnections(connection: Connection, wallet: WalletContextState) {
  if (!wallet.publicKey) {
    return [];
  }

  const walletPubkeyBytes = wallet.publicKey?.toBytes();

  // [accountType, ...publicKey?.toBytes()]
  const buf1 = Buffer.from([1]);
  const buf = Buffer.concat([buf1, walletPubkeyBytes], 33);
  const bs58Str = bs58.encode(buf);

  const collections = await connection.getProgramAccounts(COLLECTION_PROGRAM_ID, {
    encoding: 'base64',
    commitment: 'recent',
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58Str,
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
  tokenAccountOfMint: PublicKey,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('wallet not connected');
  }

  const dataU8 = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({ type: 1 }));
  const [indexAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('collection'), COLLECTION_PROGRAM_ID.toBytes(), mint.toBytes()],
    COLLECTION_PROGRAM_ID,
  );

  console.log(
    collectionAccount.toString(),
    wallet.publicKey.toString(),
    mint.toString(),
    tokenAccountOfMint.toString(),
    indexAccount.toString(),
    wallet.publicKey.toString(),
    SYSVAR_RENT_PUBKEY.toString(),
    SystemProgram.programId.toString(),
  );

  const instruction = new TransactionInstruction({
    data: Buffer.from(dataU8),
    keys: [
      { isSigner: false, isWritable: true, pubkey: collectionAccount }, // 0. `[writeable]` Collcection account
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey }, // 1. `[signer]` Authority of collection account
      { isSigner: false, isWritable: false, pubkey: mint }, // 2. `[]` Mint of token asset (supply must be 1)
      { isSigner: false, isWritable: false, pubkey: tokenAccountOfMint }, // 3. `[]` Token account of mint (amount must be 1)
      { isSigner: false, isWritable: true, pubkey: indexAccount }, // 4. `[writable]`  Collection index account (pda of ['collection', program id, mint id])
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey }, // 5. `[signer]` Funding account (must be a system account)
      { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY }, // 6. `[]` Rent info
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId }, // 7. `[]` System program id account
    ],
    programId: COLLECTION_PROGRAM_ID,
  });

  console.log('instruction: ', instruction);

  const transaction = new Transaction({ feePayer: wallet.publicKey });
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await wallet.signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

export async function getCollectionNFTs(connection: Connection, collection: PublicKey) {
  const buf1 = Buffer.from([2]); // accountType
  const buf = Buffer.concat([buf1, collection.toBytes()], 33);

  const bs58Str = bs58.encode(buf);

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

export async function starOnce(connection: Connection, wallet: WalletContextState, collectionAccount: PublicKey) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('wallet not connected');
  }

  const typeU8 = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({ type: CollectionInstructionType.LightUpStarsOnce }));

  const instruction = new TransactionInstruction({
    data: Buffer.from(typeU8),
    keys: [{ isSigner: false, isWritable: true, pubkey: collectionAccount }],
    programId: COLLECTION_PROGRAM_ID,
  });

  const transaction = new Transaction({ feePayer: wallet.publicKey });
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  const signedTransaction = await wallet.signTransaction(transaction);
  const hash = await sendAndConfirmRawTransaction(connection, signedTransaction.serialize());

  return hash;
}

export async function starMultiple(
  connection: Connection,
  wallet: WalletContextState,
  collectionAccount: PublicKey,
  instructionType: CollectionInstructionType,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('wallet not connected');
  }

  const treasuryAccount = await getTreasuryProgram();

  const typeU8 = serialize(ACCOUNT_TYPE_SCHEMA, new AccountType({ type: instructionType }));

  const instruction = new TransactionInstruction({
    data: Buffer.from(typeU8),
    keys: [
      { isSigner: false, isWritable: true, pubkey: collectionAccount },
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey },
      { isSigner: false, isWritable: true, pubkey: treasuryAccount },
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

export async function closeAccount(
  connection: Connection,
  wallet: WalletContextState,
  collectionAccount: PublicKey,
  accountType: AccountType,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('wallet not connected');
  }

  const typeU8 = serialize(
    CLOSE_ACCOUNT_INSTRUCTION_ARGS_SCHEMA,
    new CloseAccountInstructionArgs({ accountType: accountType.type }),
  );

  const instruction = new TransactionInstruction({
    data: Buffer.from(typeU8),
    keys: [
      { isSigner: false, isWritable: true, pubkey: collectionAccount },
      { isSigner: false, isWritable: true, pubkey: wallet.publicKey },
      { isSigner: true, isWritable: false, pubkey: wallet.publicKey },
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

export async function getTreasuryBalance(connection: Connection) {
  const treasury = await getTreasuryProgram();
  const balance = await connection.getBalance(treasury);
  return balance;
}
