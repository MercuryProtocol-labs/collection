use {
    crate::{
        instruction::{CollectionInstruction, CreateCollectionAccountArgs},
        utils::{create_new_account, create_or_allocate_account_raw, get_index_account},
        state::{PREFIX, AccountType, CollectionAccountData, CollectionIndexAccountData},
        error::CollectionError,
        check_id,
    },
    solana_program::{
        account_info::{AccountInfo, next_account_info},
        entrypoint::ProgramResult, 
        pubkey::Pubkey,
        program_pack::Pack,
        msg,
    },
    borsh::{BorshDeserialize, BorshSerialize},
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let instruction = CollectionInstruction::try_from_slice(input)?;
    match instruction {
        CollectionInstruction::CreateCollectionAccount(args) => {
            msg!("Instruction: Create Collection Account");
            process_create_collection_account(program_id, accounts, &args)
        },
        CollectionInstruction::IncludeToken => {
            msg!("Instruction: Include Token");
            process_create_include_token(program_id, accounts)
        }
    }
}

pub fn process_create_collection_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: &CreateCollectionAccountArgs,
) -> ProgramResult {
    assert_program_id(program_id)?;
    assert_create_collection_args(args)?;
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
        stars: 0 as u64,
        supply: 0 as u64,
        authority: *form_account_info.key,
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

pub fn process_create_include_token(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    assert_program_id(program_id)?;
    let account_info_iter = &mut accounts.iter();
    let collection_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let payer_account_info = next_account_info(account_info_iter)?;
    let index_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_info = next_account_info(account_info_iter)?;
    let system_program_info = next_account_info(account_info_iter)?;

    let mut collection_account_data = CollectionAccountData::try_from_slice_unchecked(
        &collection_account_info.data.borrow_mut())?;
    if !collection_account_data.is_initialized() {
        return Err(CollectionError::Uninitialized.into());
    }
    // check collection's authority 
    if collection_account_data.authority != *payer_account_info.key 
        || !payer_account_info.is_signer{
        return Err(CollectionError::NotCollectionAuthority.into());
    }
    assert_mint_account(mint_account_info, payer_account_info)?;
    
    let (index_account, bump_seed) = get_index_account(
        mint_account_info.key, 
    );
    if index_account != *index_account_info.key {
        return Err(CollectionError::CollectionIndexAccountMismatch.into());
    }
    let signer_seeds = &[
        PREFIX.as_bytes(),
        program_id.as_ref(),
        mint_account_info.key.as_ref(),
        &[bump_seed],
    ];
    create_or_allocate_account_raw(
        *program_id,
        index_account_info,
        rent_sysvar_info,
        system_program_info,
        payer_account_info,
        CollectionIndexAccountData::LEN,
        signer_seeds,
    )?;
    let index_account_data = CollectionIndexAccountData::new(
        *collection_account_info.key, 
        *mint_account_info.key, 
        collection_account_data.supply,
    );

    index_account_data.serialize(&mut *index_account_info.data.borrow_mut())?;
    collection_account_data.supply += 1;
    collection_account_data.serialize(&mut *collection_account_info.data.borrow_mut())?;
    Ok(())
}

fn assert_mint_account(
    mint_account_info: &AccountInfo, 
    payer_account_info: &AccountInfo,
) -> ProgramResult {
    let mint = spl_token::state::Mint::unpack_unchecked(&mint_account_info.data.borrow())?;
    if mint.supply != 1 || mint.decimals != 0 {
        return Err(CollectionError::InvalidNFT.into());
    }
    if mint.mint_authority.unwrap() != *payer_account_info.key {
        return Err(CollectionError::NotMintAuthority.into());
    }
    Ok(())
}

fn assert_program_id(program_id: &Pubkey) -> ProgramResult {
    if !check_id(program_id) {
        return Err(CollectionError::InvalidProgramId.into());
    }
    Ok(())
}

fn assert_create_collection_args(args: &CreateCollectionAccountArgs) -> ProgramResult {
    if !args.is_valid() {
        return Err(CollectionError::InvalidInstructionArguments.into());
    }
    Ok(())
}