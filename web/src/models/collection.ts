import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export enum CollectionInstructionType {
  CreateCollectionAccount = 0,
  IncludeToken = 1,
  LightUpStarsOnce = 2,
  LightUpStarsHundred = 3,
  LightUpStarsThousand = 4,
  CloseAccount = 5,
  Withdraw = 6,
}

export class CreateCollectionArgs {
  type: number;
  title: string;
  symbol: string;
  description: string;
  icon_image: string;
  header_image?: string;
  short_description?: string;
  banaer?: string;
  tags?: string[];

  constructor(args: {
    type: number;
    title: string;
    symbol: string;
    description: string;
    icon_image: string;
    header_image?: string;
    short_description?: string;
    banaer?: string;
    tags?: string[];
  }) {
    this.type = args.type;
    this.title = args.title;
    this.symbol = args.symbol;
    this.description = args.description;
    this.icon_image = args.icon_image;
    this.header_image = args.header_image;
    this.short_description = args.short_description;
    this.banaer = args.banaer;
    this.tags = args.tags;
  }
}

export class AccountType {
  type: number;

  constructor(args: { type: number }) {
    this.type = args.type;
  }
}

export class CollectionAccountData {
  account_type: AccountType;
  title: string;
  symbol: string;
  description: string;
  icon_image: string;
  supply: BN;
  stars: BN;
  authority: Uint8Array;
  header_image?: string;
  short_description?: string;
  banaer?: string;
  tags?: string[];

  constructor(args: {
    account_type: AccountType;
    title: string;
    symbol: string;
    description: string;
    icon_image: string;
    supply: BN;
    stars: BN;
    authority: Uint8Array;
    header_image?: string;
    short_description?: string;
    banaer?: string;
    tags?: string[];
  }) {
    this.account_type = args.account_type;
    this.title = args.title;
    this.symbol = args.symbol;
    this.description = args.description;
    this.icon_image = args.icon_image;
    this.supply = args.supply;
    this.stars = args.stars;
    this.authority = args.authority;
    this.header_image = args.header_image;
    this.short_description = args.short_description;
    this.banaer = args.banaer;
    this.tags = args.tags;
  }
}

export class CollectionIndexAccountData {
  account_type: AccountType;
  collection: PublicKey;
  mint: PublicKey;
  index: BN;

  constructor(args: { account_type: AccountType; collection: PublicKey; mint: PublicKey; index: BN }) {
    this.account_type = args.account_type;
    this.collection = args.collection;
    this.mint = args.mint;
    this.index = args.index;
  }
}

export class CloseAccountInstructionArgs {
  instructionType: CollectionInstructionType;
  accountType: number;

  constructor(args: { accountType: number }) {
    this.accountType = args.accountType;
    this.instructionType = CollectionInstructionType.CloseAccount;
  }
}

export const ACCOUNT_TYPE_SCHEMA = new Map([
  [
    AccountType,
    {
      kind: 'struct',
      fields: [['type', 'u8']],
    },
  ],
]);

export const CREATE_COLLECTION_ARGS_SCHEMA = new Map([
  [
    CreateCollectionArgs,
    {
      kind: 'struct',
      fields: [
        ['type', 'u8'],
        ['title', 'string'],
        ['symbol', 'string'],
        ['description', 'string'],
        ['icon_image', 'string'],
        ['header_image', { kind: 'option', type: 'string' }],
        ['short_description', { kind: 'option', type: 'string' }],
        ['banaer', { kind: 'option', type: 'string' }],
        ['tags', { kind: 'option', type: ['string'] }],
      ],
    },
  ],
]);

export const COLLECTION_ACCOUNT_DATA_SCHEMA = new Map<any, any>([
  [
    AccountType,
    {
      kind: 'struct',
      fields: [['type', 'u8']],
    },
  ],
  [
    CollectionAccountData,
    {
      kind: 'struct',
      fields: [
        ['account_type', AccountType],
        ['authority', [32]],
        ['title', 'string'],
        ['symbol', 'string'],
        ['description', 'string'],
        ['icon_image', 'string'],
        ['supply', 'u64'],
        ['stars', 'u64'],
        ['header_image', { kind: 'option', type: 'string' }],
        ['short_description', { kind: 'option', type: 'string' }],
        ['banaer', { kind: 'option', type: 'string' }],
        ['tags', { kind: 'option', type: ['string'] }],
      ],
    },
  ],
]);

export const COLLECTION_INDEX_ACCOUNT_DATA_SCHEMA = new Map([
  [
    CollectionIndexAccountData,
    {
      kind: 'struct',
      fields: [
        ['account_type', 'u8'],
        ['collection', [32]],
        ['mint', [32]],
        ['index', 'u64'],
      ],
    },
  ],
]);

export const CLOSE_ACCOUNT_INSTRUCTION_ARGS_SCHEMA = new Map<any, any>([
  [
    CloseAccountInstructionArgs,
    {
      kind: 'struct',
      fields: [
        ['instructionType', 'u8'],
        ['accountType', 'u8'],
      ],
    },
  ],
]);
