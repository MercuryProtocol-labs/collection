//! Error types

use {
    num_derive::FromPrimitive,
    solana_program::{
        decode_error::DecodeError,
        msg,
        program_error::{PrintProgramError, ProgramError},
    },
    thiserror::Error,
};

/// Errors that may be returned by the Collection program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum CollectionError {
    /// Already initialized
    #[error("Already initialized")]
    AlreadyInitialized,

    /// Uninitialized
    #[error("Uninitialized")]
    Uninitialized,

    /// Invalid owner
    #[error("Invalid nft")]
    InvalidNFT,

    /// You must be the mint authority and signer on this transaction
    #[error("You must be the mint authority and signer on this transaction")]
    NotMintAuthority,

    /// You must be the mint authority and signer on this transaction
    #[error("You must be the collection authority and signer on this transaction")]
    NotCollectionAuthority,

    /// Invalid program id
    #[error("Invalid program id")]
    InvalidProgramId,

    /// Invalid instruction arguments
    #[error("Invalid instruction arguments")]
    InvalidInstructionArguments,

    /// Collection index account mismatch
    #[error("Collection index account mismatch")]
    CollectionIndexAccountMismatch,

    /// Invalid treasury account
    #[error("Invalid treasury account")]
    InvalidTreasuryAccount,

    /// Invalid account type
    #[error("Invalid account type")]
    InvalidAccountType,

    /// Insufficient funds
    #[error("Insufficient funds")]
    InsufficientFunds,

    /// You must be the treasury manager and signer on this transaction
    #[error("You must be the treasury manager and signer on this transaction")]
    NotTreasuryManager,
}

impl PrintProgramError for CollectionError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<CollectionError> for ProgramError {
    fn from(e: CollectionError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for CollectionError {
    fn type_of() -> &'static str {
        "Collection Error"
    }
}
