/// Instructions supported by collection program.
use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
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
    CreateCollectionAccount(CreateCollectionAccountArgs),
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
        ],
        data: CollectionInstruction::CreateCollectionAccount(args).try_to_vec().unwrap(),
    }
}