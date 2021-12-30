use solana_program_test::*;
use collection::id;
use collection::processor::process_instruction;
use collection::instruction::{
    create_collection_account, 
    CreateCollectionAccountArgs, 
    include_token,
    light_up_stars_hundred,
    close_account,
};
use collection::state::{CollectionAccountData, AccountType};
use collection::utils::{get_index_account, get_treasury_account};
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
    borsh::try_from_slice_unchecked,
    native_token::sol_to_lamports,
};
mod helpers;
use helpers::{create_mint, create_associated_account, mint_tokens};
use spl_associated_token_account::get_associated_token_address;

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
        banner: Some("www.solana.com".to_string()),
        tags: Some(vec!["art".to_string(), "music".to_string()]),
    };
    let ix = create_collection_account(program_id, collection_account, payer.pubkey(), args);
    let mut transaction = Transaction::new_with_payer(
        &[ix],
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
    assert_eq!(account_data.banner, Some("www.solana.com".to_string()));
    assert_eq!(account_data.tags, Some(vec!["art".to_string(), "music".to_string()]));
}

#[tokio::test]
async fn test_include_token() {
    let program_id = id();
    let program_test = ProgramTest::new("collection", program_id, processor!(process_instruction));
    let mut context= program_test.start_with_context().await;
    
    let collection_keypair = Keypair::new();
    let collection_account = collection_keypair.pubkey();
    let args = CreateCollectionAccountArgs{
        title: "test collection".to_string(),
        symbol: "tc".to_string(),
        description: "test collection description".to_string(),
        icon_image: "https://www.google.com".to_string(),
        header_image: Some("www.solana.com".to_string()),
        short_description: Some("www.solana.com".to_string()),
        banner: Some("www.solana.com".to_string()),
        tags: Some(vec!["art".to_string(), "music".to_string()]),
    };
    let ix = create_collection_account(program_id, collection_account, context.payer.pubkey(), args);
    let mut transaction = Transaction::new_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
    );
    transaction.sign(&[&context.payer, &collection_keypair], context.last_blockhash);
    context.banks_client.process_transaction(transaction).await.unwrap();

    let mint_keypair = Keypair::new();
    let payer_pubkey = context.payer.pubkey();
    create_mint(
        &mut context, 
        &mint_keypair, 
        &payer_pubkey,
        0, 
        Some(&payer_pubkey),
    ).await.unwrap();
    create_associated_account(&mut context, &payer_pubkey, &mint_keypair.pubkey()).await.unwrap();

    let nft_ata = get_associated_token_address(&payer_pubkey, &mint_keypair.pubkey());
    mint_tokens(&mut context, &mint_keypair.pubkey(), &nft_ata, 1, &payer_pubkey, None).await.unwrap();

    let (index_account,_) = get_index_account(
        &mint_keypair.pubkey(), 
    );
    let ix = include_token(
        program_id,
        collection_keypair.pubkey(),
        mint_keypair.pubkey(),
        payer_pubkey,
        index_account,
    );
    let mut transaction = Transaction::new_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
    );
    transaction.sign(&[&context.payer, &collection_keypair], context.last_blockhash);
    context.banks_client.process_transaction(transaction).await.unwrap();
}

#[tokio::test]
async fn test_light_up_stars_hundred() {
    let program_id = id();
    let program_test = ProgramTest::new("collection", program_id, processor!(process_instruction));
    let mut context= program_test.start_with_context().await;

    let collection_keypair = Keypair::new();
    let collection_account = collection_keypair.pubkey();
    let args = CreateCollectionAccountArgs{
        title: "test collection".to_string(),
        symbol: "tc".to_string(),
        description: "test collection description".to_string(),
        icon_image: "https://www.google.com".to_string(),
        header_image: Some("www.solana.com".to_string()),
        short_description: Some("www.solana.com".to_string()),
        banner: Some("www.solana.com".to_string()),
        tags: Some(vec!["art".to_string(), "music".to_string()]),
    };
    let ix = create_collection_account(program_id, collection_account, context.payer.pubkey(), args);
    let mut transaction = Transaction::new_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
    );
    transaction.sign(&[&context.payer, &collection_keypair], context.last_blockhash);
    context.banks_client.process_transaction(transaction).await.unwrap();

    // let treasury_account = get_treasury_account();
    let (treasury_account, _) = get_treasury_account();

    // light up stars
    let payer_pubkey = context.payer.pubkey();
    
    let ix = light_up_stars_hundred(
        program_id,
        collection_keypair.pubkey(),
        payer_pubkey,
        treasury_account,
    );
    let mut transaction = Transaction::new_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
    );
    transaction.sign(&[&context.payer], context.last_blockhash);
    context.banks_client.process_transaction(transaction).await.unwrap();

    let collection_account = context.banks_client
        .get_account(collection_account)
        .await
        .expect("get_account")
        .expect("processor state account not found");
    let account_data: CollectionAccountData = try_from_slice_unchecked(&collection_account.data).unwrap();
    assert_eq!(account_data.stars, 100);
    let balance = context.banks_client.get_balance(treasury_account).await.expect("get_balance");
    assert_eq!(balance, sol_to_lamports(0.01));
}

#[tokio::test]
async fn test_close_account() {
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
        banner: Some("www.solana.com".to_string()),
        tags: Some(vec!["art".to_string(), "music".to_string()]),
    };
    let ix = create_collection_account(program_id, collection_account, payer.pubkey(), args);
    let mut transaction = Transaction::new_with_payer(
        &[ix],
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

    let ix = close_account(
        program_id, 
        collection_keypair.pubkey(), 
        payer.pubkey(), 
        payer.pubkey(),
        AccountType::CollectionAccount,
    );
    let mut transaction = Transaction::new_with_payer(
        &[ix],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();
}