#![forbid(unsafe_code)]
//! A Collection program for the Metaplex NFT.

mod entrypoint;
pub mod processor;
pub mod utils;
pub mod instruction;
pub mod error; 
pub mod state;

solana_program::declare_id!("co111CrRL738X8TKrqmLcNBstgLFZjuMtZRBW2FGpbC");