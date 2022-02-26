import * as anchor from "@project-serum/anchor";
import { Program, BN, IdlAccounts } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert } from "chai";
import { Escrow } from "../target/types/escrow";

type EscrowAccount = IdlAccounts<Escrow>["escrowAccount"];


describe("escrow", () => {
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
  
    const program = anchor.workspace.Escrow as Program<Escrow>;

    async function getAccountBalance(pubkey) {
        let account = await provider.connection.getAccountInfo(pubkey);
        return account?.lamports ?? 0;
    }

    async function createUser(airdropBalance) {
      airdropBalance = airdropBalance ?? 10 * anchor.web3.LAMPORTS_PER_SOL;
      let user = anchor.web3.Keypair.generate();
      let sig = await provider.connection.requestAirdrop(user.publicKey, airdropBalance);
      await provider.connection.confirmTransaction(sig);
  
      let wallet = new anchor.Wallet(user);
      let userProvider = new anchor.Provider(provider.connection, wallet, provider.opts);
  
      return {
        key: user,
        wallet,
        provider: userProvider,
      };
    }

    function createUsers(numUsers) {
      let promises = [];
      for(let i = 0; i < numUsers; i++) {
        promises.push(createUser(null));
      }
  
      return Promise.all(promises);
    }

    function programForUser(user) {
      return new anchor.Program(program.idl, program.programId, user.provider);
    }
  
    let mintA: Token = null;
    let initializerTokenAccountA: PublicKey = null;
    let initializer = null;
    let takerTokenAccountA: PublicKey = null;
    let taker = null;
    let pda: PublicKey = null;
  
    const takerAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
    const initializerAmount = 500;
  
    const escrowAccount = anchor.web3.Keypair.generate();
    const mintAuthority = anchor.web3.Keypair.generate();
  
    it("Initialise escrow state", async () => {
      [initializer, taker] = await createUsers(2);

      mintA = await Token.createMint(
        provider.connection,
        initializer.key,
        mintAuthority.publicKey,
        null,
        0,
        TOKEN_PROGRAM_ID
      );
  
      initializerTokenAccountA = await mintA.createAccount(
        provider.wallet.publicKey
      );
      takerTokenAccountA = await mintA.createAccount(provider.wallet.publicKey);
  
      await mintA.mintTo(
        initializerTokenAccountA,
        mintAuthority.publicKey,
        [mintAuthority],
        initializerAmount
      );
  
      let _initializerTokenAccountA = await mintA.getAccountInfo(
        initializerTokenAccountA
      );
  
      assert.ok(_initializerTokenAccountA.amount.toNumber() == initializerAmount);
    });
  
    it("Initialize escrow", async () => {
      await program.rpc.initializeEscrow(
        new BN(initializerAmount),
        new BN(takerAmount),
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            initializerDepositTokenAccount: initializerTokenAccountA,
            initializerReceiveWalletAccount: initializer.wallet.publicKey,
            escrowAccount: escrowAccount.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [escrowAccount],
        }
      );
  
      // Get the PDA that is assigned authority to token account.
      const [_pda, _nonce] = await PublicKey.findProgramAddress(
        [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
        program.programId
      );
  
      pda = _pda;
  
      let _initializerTokenAccountA = await mintA.getAccountInfo(
        initializerTokenAccountA
      );
  
      let _escrowAccount: EscrowAccount =
        await program.account.escrowAccount.fetch(escrowAccount.publicKey);
  
      // Check that the new owner is the PDA.
      assert.ok(_initializerTokenAccountA.owner.equals(pda));
  
      // Check that the values in the escrow account match what we expect.
      assert.ok(_escrowAccount.initializerKey.equals(provider.wallet.publicKey));
      assert.ok(_escrowAccount.initializerAmount.toNumber() == initializerAmount);
      assert.ok(_escrowAccount.takerAmount.toNumber() == takerAmount);
      assert.ok(
        _escrowAccount.initializerDepositTokenAccount.equals(
          initializerTokenAccountA
        )
      );
      assert.ok(
        _escrowAccount.initializerReceiveWalletAccount.equals(
            initializer.wallet.publicKey
        )
      );
    });
  
    it("Exchange escrow", async () => {
      await program.rpc.exchange({
        accounts: {
          taker: provider.wallet.publicKey,
          takerReceiveTokenAccount: takerTokenAccountA,
          pdaDepositTokenAccount: initializerTokenAccountA,
          initializerReceiveWalletAccount: initializer.wallet.publicKey,
          initializerMainAccount: provider.wallet.publicKey,
          escrowAccount: escrowAccount.publicKey,
          pdaAccount: pda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
      });
  
      let _takerTokenAccountA = await mintA.getAccountInfo(takerTokenAccountA);
      let _initializerTokenAccountA = await mintA.getAccountInfo(
        initializerTokenAccountA
      );
  
      // Check that the initializer gets back ownership of their token account.
      assert.ok(_takerTokenAccountA.owner.equals(provider.wallet.publicKey));
  
      assert.ok(_takerTokenAccountA.amount.toNumber() == initializerAmount);
      assert.ok(_initializerTokenAccountA.amount.toNumber() == 0);
    //   assert.ok(_initializerTokenAccountB.amount.toNumber() == takerAmount);
    //   assert.ok(_takerTokenAccountB.amount.toNumber() == 0);
    });
  
    let newEscrow = anchor.web3.Keypair.generate();
  
    it("Initialize escrow and cancel escrow", async () => {
      // Put back tokens into initializer token A account.
      await mintA.mintTo(
        initializerTokenAccountA,
        mintAuthority.publicKey,
        [mintAuthority],
        initializerAmount
      );
  
      await program.rpc.initializeEscrow(
        new BN(initializerAmount),
        new BN(takerAmount),
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            initializerDepositTokenAccount: initializerTokenAccountA,
            initializerReceiveWalletAccount: initializer.wallet.publicKey,
            escrowAccount: newEscrow.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [newEscrow],
        }
      );
  
      let _initializerTokenAccountA = await mintA.getAccountInfo(
        initializerTokenAccountA
      );
  
      // Check that the new owner is the PDA.
      assert.ok(_initializerTokenAccountA.owner.equals(pda));
  
      // Cancel the escrow.
      await program.rpc.cancelEscrow({
        accounts: {
          initializer: provider.wallet.publicKey,
          pdaDepositTokenAccount: initializerTokenAccountA,
          pdaAccount: pda,
          escrowAccount: newEscrow.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });
  
      // Check the final owner should be the provider public key.
      _initializerTokenAccountA = await mintA.getAccountInfo(
        initializerTokenAccountA
      );
      assert.ok(
        _initializerTokenAccountA.owner.equals(provider.wallet.publicKey)
      );
  
      // Check all the funds are still there.
      assert.ok(_initializerTokenAccountA.amount.toNumber() == initializerAmount);
    });
  });