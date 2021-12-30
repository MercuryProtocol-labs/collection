use {
    crate::{
        state::PREFIX,
        id,
    },
    solana_program::{
        account_info::AccountInfo,
        entrypoint::ProgramResult,
        msg,
        program::{invoke, invoke_signed},
        pubkey::Pubkey,
        system_instruction,
        sysvar::{rent::Rent, Sysvar},
    },
    std::convert::TryInto,
};

#[inline(always)]
pub fn create_new_account<'a>(
    from_info: &AccountInfo<'a>,
    new_account_info: &AccountInfo<'a>,
    space: usize,
    owner: &Pubkey,
    rent_info: &AccountInfo<'a>,
) -> ProgramResult {
    let rent = &Rent::from_account_info(rent_info)?;
    let required_lamports = rent
        .minimum_balance(space)
        .max(1)
        .saturating_sub(new_account_info.lamports());

    msg!("Transfer {} lamports to the new account", required_lamports);
    invoke(
        &system_instruction::create_account(
            from_info.key,
            new_account_info.key,
            required_lamports,
            space as u64,
            owner,
        ),
        &[from_info.clone(), new_account_info.clone()],
    )?;
    Ok(())
}

/// Create account almost from scratch, lifted from
/// https://github.com/solana-labs/solana-program-library/tree/master/associated-token-account/program/src/processor.rs#L51-L98
#[inline(always)]
pub fn create_or_allocate_account_raw<'a>(
    program_id: Pubkey,
    new_account_info: &AccountInfo<'a>,
    rent_sysvar_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    payer_info: &AccountInfo<'a>,
    size: usize,
    signer_seeds: &[&[u8]],
) -> ProgramResult {
    let rent = &Rent::from_account_info(rent_sysvar_info)?;
    let required_lamports = rent
        .minimum_balance(size)
        .max(1)
        .saturating_sub(new_account_info.lamports());

    if required_lamports > 0 {
        msg!("Transfer {} lamports to the new account", required_lamports);
        invoke(
            &system_instruction::transfer(&payer_info.key, new_account_info.key, required_lamports),
            &[
                payer_info.clone(),
                new_account_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    }

    let accounts = &[new_account_info.clone(), system_program_info.clone()];

    msg!("Allocate space for the account");
    invoke_signed(
        &system_instruction::allocate(new_account_info.key, size.try_into().unwrap()),
        accounts,
        &[&signer_seeds],
    )?;

    msg!("Assign the account to the owning program");
    invoke_signed(
        &system_instruction::assign(new_account_info.key, &program_id),
        accounts,
        &[&signer_seeds],
    )?;

    Ok(())
}

pub fn get_index_account(
    spl_token_mint_address: &Pubkey,
) -> (Pubkey, u8) {
    let program_id = id();
    let seeds = &[
        PREFIX.as_bytes(),
        program_id.as_ref(),
        spl_token_mint_address.as_ref(),
    ];
    let (collection_address, bump_seed) = Pubkey::find_program_address(seeds, &program_id);
    (collection_address, bump_seed)
}

pub fn get_treasury_account() -> (Pubkey, u8) {
    const TREASURY: &str = "treasury";
    let program_id = id();
    let seeds = &[
        PREFIX.as_bytes(),
        TREASURY.as_bytes(),
        program_id.as_ref(),
    ];
    let (treasury_address, bump_seed) = Pubkey::find_program_address(seeds, &program_id);
    (treasury_address, bump_seed)
}
