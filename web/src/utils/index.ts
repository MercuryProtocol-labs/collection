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
