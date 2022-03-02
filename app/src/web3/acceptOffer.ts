import * as anchor from "@project-serum/anchor";
import { IdlAccounts } from "@project-serum/anchor";
import {
    Connection,
    LAMPORTS_PER_SOL,
    SystemProgram,
    PublicKey,
    TransactionInstruction,
  } from "@solana/web3.js";
import {
    AccountInfo,
    AccountLayout,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    Token,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
import {
    createAssociatedAccountInstruction,
    createWrappedNativeAccountInstructions,
} from "./escrowInstructions";
import { Escrow } from "../idl/types/escrow";
import { generateTransaction, signAndSendTransaction } from "./transaction";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";

type EscrowAccount = IdlAccounts<Escrow>["escrowAccount"];

const checkExistanceOfAssociatedAccount = async (
    connection: Connection,
    associatedAccount: PublicKey,
    nftAddress: string
) => {
    const accountInfo = await connection.getAccountInfo(associatedAccount);

    if (accountInfo === null) return false;
    if (accountInfo.data.length !== AccountLayout.span) return false;
    const data = Buffer.from(accountInfo.data);
    const decodeAccountInfo: AccountInfo = AccountLayout.decode(data);
    const mint = new PublicKey(decodeAccountInfo.mint);
    return mint.toBase58() === nftAddress;
};

export async function acceptOffer({
    connection,
    wallet,
    program,
    escrowAccountAddressString,
    buyer,
    sellerAddressString,
    sellerNFTAddressStr,
    signTransaction,
}: {
    connection: Connection;
    wallet: any;
    program: anchor.Program<anchor.Idl> | undefined;
    escrowAccountAddressString: string;
    buyer: PublicKey;
    sellerAddressString: string;
    sellerNFTAddressStr: string;
    signTransaction: SignerWalletAdapterProps["signTransaction"];
}): Promise<void> {
    const escrowAccount = new PublicKey(escrowAccountAddressString);
    const sellerNFT = new PublicKey(sellerNFTAddressStr);
    const seller = new PublicKey(sellerAddressString);

    const instructions: TransactionInstruction[] = [];

    if (program) {
        let _escrowAccount = await program.account.escrowAccount.fetch(escrowAccount);

        const associatedAccountForReceivingNFT = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            sellerNFT,
            buyer
        );
        const hasAssociatedAccount = await checkExistanceOfAssociatedAccount(
            connection,
            associatedAccountForReceivingNFT,
            sellerNFTAddressStr
        );
        if (!hasAssociatedAccount) {
            instructions.push(
                await createAssociatedAccountInstruction({
                    associatedToken: associatedAccountForReceivingNFT,
                    mintToken: sellerNFT,
                    owner: buyer,
                    payer: buyer,
                })
            );
        }

        console.log(
            "Associated Token Account for Buyer",
            associatedAccountForReceivingNFT.toBase58()
        );

        // confirm transaction
        const transaction = await generateTransaction({
            connection,
            feePayer: buyer,
        });

        instructions.forEach((instruction) => transaction.add(instruction));

        const signature = await signAndSendTransaction(
            connection,
            signTransaction,
            transaction
        );
        console.log("Transaction confirmed. Signature", signature);
        
    
        console.log(
            "Associated Token Account for Buyer",
            associatedAccountForReceivingNFT.toBase58()
        );

        // Get the PDA that is assigned authority to token account.
        const [_pda, _nonce] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
            program.programId
        );

        await program.rpc.exchange({
            accounts: {
              taker: wallet.publicKey,
              takerReceiveTokenAccount: associatedAccountForReceivingNFT,
              pdaDepositTokenAccount: _escrowAccount.initializerDepositTokenAccount,
              initializerReceiveWalletAccount: _escrowAccount.initializerReceiveWalletAccount,
              initializerMainAccount: _escrowAccount.initializerKey,
              escrowAccount: escrowAccount,
              pdaAccount: _pda,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            },
          });
    }
};