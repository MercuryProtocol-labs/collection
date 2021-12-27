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
