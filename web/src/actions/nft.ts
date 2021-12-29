import { PublicKey, Connection } from '@solana/web3.js';
import { programs } from '@metaplex/js';

const { Metadata } = programs.metadata;

export async function getMetadata(connection: Connection, mint: PublicKey) {
  const metadataAta = await Metadata.getPDA(mint);
  try {
    const metadata = await Metadata.load(connection, metadataAta);

    return metadata;
  } catch (error: any) {
    // may be unable to find account
    console.error(error);
  }
}
