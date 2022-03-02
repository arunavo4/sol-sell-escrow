import * as anchor from "@project-serum/anchor";
import {
    Connection,
    LAMPORTS_PER_SOL,
    SystemProgram,
    PublicKey,
    TransactionInstruction,
  } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
    createAssociatedAccountInstruction,
} from "./escrowInstructions";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    Token,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
import { CreateTxHistoryInput, TransactionStatus } from "../types";
import { generateTransaction, signAndSendTransaction } from "./transaction";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";

export async function requestOffer({
    connection,
    seller,
    buyerAddressStr,
    sellerNFTAddressStr,
    wallet,
    program,
    amountInSol,
    fee,
    signTransaction,
}: {
    connection: Connection;
    seller: PublicKey;
    buyerAddressStr: string;
    sellerNFTAddressStr: string;
    wallet: any;
    program: anchor.Program<anchor.Idl> | undefined;
    amountInSol: number;
    fee: number;
    signTransaction: SignerWalletAdapterProps["signTransaction"];
}): Promise<CreateTxHistoryInput> {
    const totalAmountInLamport = new BigNumber(amountInSol)
    .plus(new BigNumber(fee))
    .multipliedBy(LAMPORTS_PER_SOL)
    .toNumber();
    const feeInLamport = fee * LAMPORTS_PER_SOL;
    const buyer = new PublicKey(buyerAddressStr);
    const sellerNFT = new PublicKey(sellerNFTAddressStr);
    const instructions: TransactionInstruction[] = [];

    const associatedAccountForSeller = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        NATIVE_MINT,
        seller
    );

    const associatedAccountForNFT = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        sellerNFT,
        seller
    );

    console.log(
        "Associated Token Account for Seller NFT",
        associatedAccountForNFT.toBase58()
    );

    // Check if seller has an associated token for native mint
    const info = await connection.getAccountInfo(associatedAccountForSeller);

    if (info === null) {
        instructions.push(
            await createAssociatedAccountInstruction({
                associatedToken: associatedAccountForSeller,
                mintToken: NATIVE_MINT,
                owner: seller,
                payer: seller,
            })
        );
    }

    // confirm transaction
    const transaction = await generateTransaction({
        connection,
        feePayer: seller,
    });

    instructions.forEach((instruction) => transaction.add(instruction));

    const signature = await signAndSendTransaction(
        connection,
        signTransaction,
        transaction
    );
    console.log("Transaction confirmed. Signature", signature);

    console.log(
        "Associated Token Account for Seller:",
        associatedAccountForSeller.toBase58()
    );

    const escrowAccount = anchor.web3.Keypair.generate();

    if (program) {
        await program.rpc.initializeEscrow(
            new anchor.BN(1),
            new anchor.BN(totalAmountInLamport),
            {
            accounts: {
                initializer: wallet.publicKey,
                initializerDepositTokenAccount: associatedAccountForNFT,
                initializerReceiveWalletAccount: wallet.publicKey,
                escrowAccount: escrowAccount.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [escrowAccount],
            }
        );
    }

    return {
        buyerAddress: buyerAddressStr,
        sellerAddress: seller.toBase58(),
        escrowAddress: escrowAccount.publicKey.toBase58(),
        nftAddress: sellerNFTAddressStr,
        offeredAmount: amountInSol,
        status: TransactionStatus.REQUESTED,
    };
};