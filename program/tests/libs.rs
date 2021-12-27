use solana_program_test::*;
use collection::id;
use collection::processor::process_instruction;
use collection::instruction::{CollectionInstruction, CreateCollectionAccountArgs};
use collection::state::CollectionAccountData;
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
    instruction::{Instruction, AccountMeta},
    sysvar::rent,
    system_program,
    borsh::try_from_slice_unchecked,
};
use borsh::ser::BorshSerialize;

#[tokio::test]
async fn test_create_collection_account() {
    let program_id = id();
    let program_test = ProgramTest::new("collection", program_id, processor!(process_instruction));
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    let collection_keypair = Keypair::new();
    let collection_account = collection_keypair.pubkey();
    let args = CreateCollectionAccountArgs{
        title: "test collection".to_string(),
        symbol: "tc".to_string(),
        description: "test collection description".to_string(),
        icon_image: "https://www.google.com".to_string(),
        header_image: Some("www.solana.com".to_string()),
        short_description: Some("www.solana.com".to_string()),
        banaer: Some("www.solana.com".to_string()),
        tags: Some(vec!["art".to_string(), "music".to_string()]),
    };
    let instruction_data = CollectionInstruction::CreateCollectionAccount(args).try_to_vec().unwrap();
    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_bytes(
            program_id,
            &instruction_data,
            vec![
                AccountMeta::new(collection_account, true),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new_readonly(rent::id(), false),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        )],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer, &collection_keypair], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();

    let collection_account = banks_client
        .get_account(collection_account)
        .await
        .expect("get_account")
        .expect("processor state account not found");
    let account_data: CollectionAccountData = try_from_slice_unchecked(&collection_account.data).unwrap();
    assert_eq!(account_data.is_initialized(), true);
    assert_eq!(account_data.title, "test collection".clone());
    assert_eq!(account_data.symbol, "tc".clone());
    assert_eq!(account_data.description, "test collection description".clone());
    assert_eq!(account_data.icon_image, "https://www.google.com".clone());
    assert_eq!(account_data.short_description, Some("www.solana.com".to_string()));
    assert_eq!(account_data.short_description, Some("www.solana.com".to_string()));
    assert_eq!(account_data.banaer, Some("www.solana.com".to_string()));
    assert_eq!(account_data.tags, Some(vec!["art".to_string(), "music".to_string()]));
}