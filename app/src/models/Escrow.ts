import * as anchor from "@project-serum/anchor";

export type AccountData = {
    initializer_key: anchor.web3.PublicKey;
    initializer_deposit_token_account: anchor.web3.PublicKey;
    initializer_receive_wallet_account: anchor.web3.PublicKey;
    initializer_amount: anchor.BN;
    taker_amount: anchor.BN;
};

export class EscrowAccount{
    publicKey: anchor.web3.PublicKey;
    initializer_key: anchor.web3.PublicKey;
    initializer_deposit_token_account: anchor.web3.PublicKey;
    initializer_receive_wallet_account: anchor.web3.PublicKey;
    initializer_amount: anchor.BN;
    taker_amount: anchor.BN;

    constructor(publicKey: anchor.web3.PublicKey, account: AccountData){
        this.publicKey = publicKey;
        this.initializer_key = account.initializer_key;
        this.initializer_deposit_token_account = account.initializer_deposit_token_account;
        this.initializer_receive_wallet_account = account.initializer_receive_wallet_account;
        this.initializer_amount = account.initializer_amount;
        this.taker_amount = account.taker_amount;
    }

    get key() {
        return this.publicKey.toBase58();
    }
}