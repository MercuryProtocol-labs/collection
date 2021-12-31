import { PublicKey } from '@solana/web3.js';

export function shortAddress(address: string | PublicKey) {
  if (!address) {
    return '';
  }

  if (address instanceof PublicKey) {
    address = address.toString();
  }

  return `${address.substr(0, 5)}...${address.substr(-4)}`;
}

// export function metadataURIToImgURL(uri: string): Promise<string> {
//   return new Promise((resolve) => {
//     fetch(uri)
//       .then((res) => res.json())
//       .then((data) => {
//         resolve(data.image);
//       })
//       .catch(() => {
//         resolve('');
//       });
//   });
// }
