import * as anchor from "@project-serum/anchor";
import {
    PublicKey,
  } from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    Token,
    TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";


export async function cancelOffer({
    wallet,
    program,
    sellerAddressString,
    escrowAccountAddressString,
    nftAddressString,
}: {
    wallet: any;
    program: anchor.Program<anchor.Idl> | undefined;
    escrowAccountAddressString: string;
    sellerAddressString: string;
    nftAddressString: string;
}): Promise<void> {
    const escrowAccount = new PublicKey(escrowAccountAddressString);
    const seller = new PublicKey(sellerAddressString);
    if (program) {
        let _escrowAccount = await program.account.escrowAccount.fetch(escrowAccount);

        // Get the PDA that is assigned authority to token account.
        const [_pda, _nonce] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
            program.programId
        );

        const nft = new PublicKey(nftAddressString);

        const associatedAccountForNFT = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft,
            seller
        );

        console.log({ associatedAccountForNFT: associatedAccountForNFT.toBase58() });

        // Cancel the escrow.
        await program.rpc.cancelEscrow({
            accounts: {
                initializer: _escrowAccount.initializerKey,
                pdaDepositTokenAccount: associatedAccountForNFT,
                pdaAccount: _pda,
                escrowAccount: escrowAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
        });


    }
};