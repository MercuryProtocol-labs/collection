/// Instructions supported by collection program.
use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
        system_program,
    },
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
    pub banaer: Option<String>,
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
    ///   0. `[writeable, singer]` Collcection account
    ///   1. `[]` Mint of token asset
    ///   2. `[signer]` Funding account (must be a system account)
    ///   3. `[writable]`  Collection index account (pda of ['collection', program id, mint id])
    ///   4. `[]` Rent info
    ///   5. `[]` System program id account
    IncludeToken,
}

/// create collection account instruction
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

pub fn include_token(
    program_id: Pubkey,
    collection_account: Pubkey,
    mint_account: Pubkey,
    payer_account: Pubkey,
    index_account: Pubkey,
) -> Instruction{
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(collection_account, true),
            AccountMeta::new(mint_account, false),
            AccountMeta::new(payer_account, true),
            AccountMeta::new(index_account, false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: CollectionInstruction::IncludeToken.try_to_vec().unwrap(),
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
        && (self.banaer.is_none() || self.banaer.as_ref().unwrap().len() <= CreateCollectionAccountArgs::MAX_URI_LENGTH)
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