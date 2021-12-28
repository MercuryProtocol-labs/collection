use {
    solana_program::{
        borsh::try_from_slice_unchecked,
        program_error::ProgramError,
        pubkey::Pubkey,
    },
    borsh::{BorshDeserialize, BorshSerialize},
};

pub const PREFIX: &str = "collection";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone, Copy)]
pub enum AccountType {
    Uninitialized,
    CollectionAccount,
    CollectionIndexAccount,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CollectionAccountData {
    pub account_type: AccountType,
    pub title: String,
    pub symbol: String,
    pub description: String,
    pub icon_image: String,
    pub supply: u64,
    pub stars: u64,
    pub authority: Pubkey,
    pub header_image: Option<String>,
    pub short_description: Option<String>,
    pub banaer: Option<String>,
    pub tags: Option<Vec<String>>,
}

impl CollectionAccountData {
    pub fn try_from_slice_unchecked(data: &[u8]) -> Result<CollectionAccountData, ProgramError> {
        let result: CollectionAccountData = try_from_slice_unchecked(data)?;
        Ok(result)
    }

    pub fn is_initialized(&self) -> bool {
        self.account_type == AccountType::CollectionAccount
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CollectionIndexAccountData {
    pub account_type: AccountType,
    pub collection: Pubkey,
    pub mint: Pubkey,
    pub index: u64,
}

impl CollectionIndexAccountData {
    pub const LEN: usize = 1 + 32 + 32 + 8;

    pub fn is_initialized(&self) -> bool {
        self.account_type == AccountType::CollectionIndexAccount
    }

    pub fn new(collection: Pubkey, mint: Pubkey, index: u64) -> CollectionIndexAccountData {
        return CollectionIndexAccountData {
            account_type: AccountType::CollectionIndexAccount,
            collection,
            mint,
            index,
        };
    }
}