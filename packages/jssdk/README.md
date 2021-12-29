# Collection JavaScript API

This is the Collection Javascript API.

[Latest API Documentation](https://github.com/MercuryProtocol-labs/collection)

## Installation

### Yarn

```
$ yarn add @mercury-protocol/collection-js
```

### npm

```
$ npm install --save @mercury-protocol/collection-js
```

## Usage

### Javascript

```js
const {getTreasuryBalance} = require('@mercury-protocol/collection-js');
console.log(getTreasuryBalance());
```

### ES6

```js
import {getTreasuryBalance} from '@mercury-protocol/collection-js';
console.log(getTreasuryBalance());
```

## Examples

Example scripts for the web3.js repo and native programs:

- [Collection](https://github.com/MercuryProtocol-labs/collection)

### How to create collection

```tsx
import {useWallet, useConnection} from '@solana/wallet-adapter-react';
import {createCollection, CreateCollectionArgs} from '@mercury-protocol/collection-js';

export default () => {
  const wallet = useWallet();
  const {connection} = useConnection();

  const handleCreate = async () => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) return;

    const args = {
      type: 0,
      title: 'xx',
      symbol: 'xx',
      description: 'xx',
      icon_image: 'xx',
      header_image: 'xx',
      short_description: 'xx',
      banaer: 'xx',
      tags: ['xx'],
    };

    const {hash, pubkey} = await createCollection(
      connection,
      wallet.publicKey,
      new CreateCollectionArgs(args),
      wallet.signTransaction,
    );

    console.log({hash, pubkey});
  };

  return <button onClick={handleCreate}>Create Collection</button>;
};
```

### How to get all collection

```tsx
import {useConnection} from '@solana/wallet-adapter-react';
import {getCollections} from '@mercury-protocol/collection-js';

export default () => {
  const {connection} = useConnection();

  const requireList = async () => {
    const collections = await getCollections(connection);

    console.log(collections);
  };

  return <button onClick={requireList}>Create Collection</button>;
};
```

### How to add NFT to collection

```tsx
import {PublicKey} from '@solana/web3.js';
import {useWallet, useConnection} from '@solana/wallet-adapter-react';
import {addNFTToCollection} from '@mercury-protocol/collection-js';
import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} from '@solana/spl-token';

export default () => {
  const wallet = useWallet();
  const {connection} = useConnection();

  const addNFT = async () => {
    if (!wallet?.publicKey || !wallet?.signTransaction) return;

    const collectionId = new PublicKey('Ht36NhfTf5xLjv9oWCwBxR5uuQcttKpuQZyo9CkLtjdD');
    const mint = new PublicKey('J4rMSynk6RwZdifkfLaQYBvgRpKNG3nuis7BDPv33hp9');
    const [tokenAccountOfMint] = await PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const hash = await addNFTToCollection(
      connection,
      wallet.publicKey,
      collectionId,
      mint,
      tokenAccountOfMint,
      wallet.signTransaction,
    );
    console.log('hash: ', hash);
  };

  return <button onClick={addNFT}>addNFT</button>;
};
```
