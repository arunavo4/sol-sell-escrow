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
    seller,
    escrowAccountAddressString,
    nftAddressString,
}: {
    wallet: any;
    program: anchor.Program<anchor.Idl> | undefined;
    seller: PublicKey;
    escrowAccountAddressString: string;
    nftAddressString: string;
}): Promise<void> {
    const escrowAccountAddress = new PublicKey(escrowAccountAddressString);

    if (program) {
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
                initializer: wallet.publicKey,
                pdaDepositTokenAccount: associatedAccountForNFT,
                pdaAccount: _pda,
                escrowAccount: escrowAccountAddress,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
        });


    }
};