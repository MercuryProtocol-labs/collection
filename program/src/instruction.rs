/// Instructions supported by collection program.
use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
        system_program,
    },
    crate::state::AccountType,
};

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct CreateCollectionAccountArgs {
    pub title: String,
    pub symbol: String,
    pub description: String,
    pub icon_image: String,
    pub header_image: Option<String>,
    pub short_description: Option<String>,
    pub banner: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum CollectionInstruction {
    /// create collection account
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable, signer]` Collcection account
    ///   1. `[signer]` Funding account (must be a system account)
    ///   2. `[]` System rent account
    ///   3. `[]` System program id account
    CreateCollectionAccount(CreateCollectionAccountArgs),

    /// include token to the collection
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable]` Collcection account
    ///   1. `[signer]` Authority of collection account
    ///   2. `[]` Mint of token asset (supply must be 1)
    ///   3. `[]` Token account of mint (amount must be 1)
    ///   4. `[writable]`  Collection index account (pda of ['collection', program id, mint id])
    ///   5. `[signer]` Funding account (must be a system account)
    ///   6. `[]` Rent info
    ///   7. `[]` System program id account
    IncludeToken,

    /// light up collection stars once
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable, singer]` Collcection account
    LightUpStarsOnce,

    /// light up collection stars one hundred
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable, singer]` Collcection account
    ///   1. `[signer]` Funding account (must be a system account)
    ///   2. `[writable]` Collection treasury account (pda of ['collection', 'treasury', program id])
    ///   3. `[]` System program id account
    LightUpStarsHundred,

    /// light up collection stars one thousand
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable, singer]` Collcection account
    ///   1. `[signer]` Funding account (must be a system account)
    ///   2. `[writable]` Collection treasury account (pda of ['collection', 'treasury', program id])
    ///   3. `[]` System program id account
    LightUpStarsThousand,

    /// create collection account
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[writeable]` Account
    ///   1. `[writeable]` Funding recipient account (must be a system account)
    ///   2. `[signer]` Account's authority
    CloseAccount(AccountType),

    /// withdraw funds in program pda
    ///
    /// Accounts expected by:
    /// 
    ///   0. `[signer]` Program id owner account (must be a system account)
    ///   1. `[writable]` Collection treasury account (pda of ['collection', 'treasury', program id])
    ///   2. `[writable]` Destination account
    Withdraw,
}

/// Creates a `CreateCollectionAccount` instruction.
pub fn create_collection_account(
    program_id: Pubkey,
    collection_account: Pubkey,
    from_account: Pubkey,
    args: CreateCollectionAccountArgs,
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(collection_account, true),
            AccountMeta::new_readonly(from_account, true),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: CollectionInstruction::CreateCollectionAccount(args).try_to_vec().unwrap(),
    }
}

/// Creates an `IncludeToken` instruction.
pub fn include_token(
    program_id: Pubkey,
    collection_account: Pubkey,
    collection_authority_account: Pubkey,
    mint_account: Pubkey,
    mint_token_account: Pubkey,
    index_account: Pubkey,
    payer_account: Pubkey,
) -> Instruction{
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(collection_account, false),
            AccountMeta::new(collection_authority_account, true),
            AccountMeta::new(mint_account, false),
            AccountMeta::new(mint_token_account, false),
            AccountMeta::new(index_account, false),
            AccountMeta::new(payer_account, true),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: CollectionInstruction::IncludeToken.try_to_vec().unwrap(),
    }
}

/// Creates a `LightUpStarsOnce` instruction.
pub fn light_up_stars_once(
    program_id: Pubkey,
    collection_account: Pubkey,
) -> Instruction{
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(collection_account, true),
        ],
        data: CollectionInstruction::LightUpStarsOnce.try_to_vec().unwrap(),
    }
}

/// Creates a `LightUpStarsHundred` instruction.
pub fn light_up_stars_hundred(
    program_id: Pubkey,
    collection_account: Pubkey,
    source_account: Pubkey,
    destination_account: Pubkey,
) -> Instruction{
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(collection_account, false),
            AccountMeta::new(source_account, true),
            AccountMeta::new(destination_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: CollectionInstruction::LightUpStarsHundred.try_to_vec().unwrap(),
    }
}

/// Creates a `CloseAccount` instruction.
pub fn close_account(
    program_id: Pubkey,
    state_account: Pubkey,
    recipient_account: Pubkey,
    authority_account: Pubkey,
    account_type: AccountType,
) -> Instruction{
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(state_account, false),
            AccountMeta::new(recipient_account, false),
            AccountMeta::new(authority_account, true),
        ],
        data: CollectionInstruction::CloseAccount(account_type).try_to_vec().unwrap(),
    }
}

/// Creates a `Withdraw` instruction.
pub fn withdraw(
    program_id: Pubkey,
    treasury_manager_account: Pubkey,
    treasury_account: Pubkey,
    recipient_account: Pubkey,
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(treasury_manager_account, true),
            AccountMeta::new(treasury_account, false),
            AccountMeta::new(recipient_account, false),
        ],
        data: CollectionInstruction::Withdraw.try_to_vec().unwrap(),
    }
}

impl CreateCollectionAccountArgs {
    const MAX_TITLE_LENGTH: usize = 32;

    const MAX_SYMBOL_LENGTH: usize = 10;

    const MAX_URI_LENGTH: usize = 200;

    const MAX_DESCRIPTION_LENGTH: usize = 800;

    const MAX_SHORT_DESCRIPTION_LENGTH: usize = 800;

    const MAX_TAG_LENGTH: usize = 20;

    const MAX_TAGS_ARRAY_LENGTH: usize = 6;

    pub fn is_valid(&self) -> bool {
        self.title.len() <= CreateCollectionAccountArgs::MAX_TITLE_LENGTH
        && self.symbol.len() <= CreateCollectionAccountArgs::MAX_SYMBOL_LENGTH
        && self.description.len() <= CreateCollectionAccountArgs::MAX_DESCRIPTION_LENGTH
        && self.icon_image.len() <= CreateCollectionAccountArgs::MAX_URI_LENGTH 
        && (self.header_image.is_none() || self.header_image.as_ref().unwrap().len() <= CreateCollectionAccountArgs::MAX_URI_LENGTH)
        && (self.short_description.is_none() || self.short_description.as_ref().unwrap().len() <= CreateCollectionAccountArgs::MAX_SHORT_DESCRIPTION_LENGTH)
        && (self.banner.is_none() || self.banner.as_ref().unwrap().len() <= CreateCollectionAccountArgs::MAX_URI_LENGTH)
        && self.check_tags()
    }

    pub fn check_tags(&self) -> bool {
        if self.tags.is_none() {
            return true;
        }
        if self.tags.as_ref().unwrap().len() > CreateCollectionAccountArgs::MAX_TAGS_ARRAY_LENGTH {
            return false;
        }
        for tag in self.tags.as_ref().unwrap() {
            if tag.len() >= CreateCollectionAccountArgs::MAX_TAG_LENGTH {
                return false;
            }
        }
        true
    }
}