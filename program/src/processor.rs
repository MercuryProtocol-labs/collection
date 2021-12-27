use {
    crate::{
        instruction::{CollectionInstruction, CreateCollectionAccountArgs},
        utils::create_new_account,
        state::{AccountType, CollectionAccountData},
    },
    solana_program::{
        account_info::{AccountInfo, next_account_info},
        entrypoint::ProgramResult, 
        pubkey::Pubkey,
        msg,
    },
    borsh::{BorshDeserialize, BorshSerialize},
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    msg!("data:{:?}", input);
    let instruction = CollectionInstruction::try_from_slice(input)?;
    match instruction {
        CollectionInstruction::CreateCollectionAccount(args) => {
            msg!("Instruction: Initialized Program");
            process_create_collection_account(program_id, accounts, &args)
        },
    }
}

pub fn process_create_collection_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: &CreateCollectionAccountArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let collection_account_info = next_account_info(account_info_iter)?;
    let form_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;

    let collection_account_data = CollectionAccountData {
        account_type: AccountType::CollectionAccount,
        title: args.title.clone(),
        symbol: args.symbol.clone(),
        description: args.description.clone(),
        icon_image: args.icon_image.clone(),
        suply: 0 as u64,
        owner: *form_account_info.key,
        header_image: args.header_image.clone(),
        short_description: args.short_description.clone(),
        banaer: args.banaer.clone(),
        tags: args.tags.clone(),
    };
    let mut data: Vec<u8> = Vec::new();
    collection_account_data.serialize(&mut data)?;
    create_new_account(
        form_account_info,
        collection_account_info,
        data.len(),
        program_id,
        rent_account_info,
    ).unwrap();
    
    collection_account_data.serialize(&mut *collection_account_info.data.borrow_mut())?;
    Ok(())
}