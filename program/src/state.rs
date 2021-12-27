use {
    solana_program::{
        borsh::try_from_slice_unchecked,
        program_error::ProgramError,
        pubkey::Pubkey,
    },
    borsh::{BorshDeserialize, BorshSerialize},
};

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone, Copy)]
pub enum AccountType {
    Uninitialized,
    CollectionAccount,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CollectionAccountData {
    pub account_type: AccountType,
    pub title: String,
    pub symbol: String,
    pub description: String,
    pub icon_image: String,
    pub suply: u64,
    pub owner: Pubkey,
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
        self.account_type != AccountType::Uninitialized
    }
}