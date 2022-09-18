// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const transferHalfAmount = async() => {
    // Connect to devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate Keypair (account we'll be sending from)
    const from = Keypair.generate();
    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Get the current balance
    var fromBalance = await connection.getBalance(from.publicKey);
    console.log(parseInt(fromBalance/LAMPORTS_PER_SOL));
    // Add 10 SOL if the current balance is empty
    if (parseInt(fromBalance) == 0) {
        // Aidrop 2 SOL to Sender wallet
        console.log("Empty wallet is detected. Airdopping some SOL to Sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
            from.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature
        });
        console.log("Airdrop completed for the Sender account");
        // update the wallet balance
        var fromBalance = await connection.getBalance(from.publicKey);
        console.log(parseInt(fromBalance/LAMPORTS_PER_SOL));
    }

    // Get the 50% amount from the sender's wallet
    const sendingLamportsPerSol = fromBalance/2

    // Transfer 50% of wallet balance
    console.log("Sending 50% of wallet balance...")
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports:sendingLamportsPerSol,
        })
    )

    // sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
    )

    // update balance
    // Get wallet balance
    var fromBalance = await connection.getBalance(from.publicKey);
    console.log(`from balance is ${parseInt(fromBalance/LAMPORTS_PER_SOL)} SOL`);
    var toBalance = await connection.getBalance(to.publicKey);
    console.log(`to balance is ${parseInt(toBalance/LAMPORTS_PER_SOL)} SOL`);

    console.log('Signature is ', signature);

}

transferHalfAmount()

