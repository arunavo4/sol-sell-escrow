# NFT (SPL Token) Sell Escrow
This project is inspired from [Sol-Hayama](https://github.com/tomoima525/sol-hayama) but its opposite, its a NFT Sell Offer rather than NFT Buy Offer.

Test it out, currently deployed on Solana devnet.

<img width="1490" alt="Screenshot 2022-04-15 at 11 08 35 AM" src="https://user-images.githubusercontent.com/28377631/163526659-2541bfa2-e378-44bb-8347-03b834b51ecc.png">


## Development Cycle
```
# Make sure you’re on the localnet.
solana config set --url localhost
# And check your Anchor.toml file.

# Code…

# Run the tests.
anchor test

# Build, deploy and start a local ledger.
anchor localnet
# Or
solana-test-validator
anchor build
anchor deploy

# Copy the new IDL to the frontend.
anchor run copy-idl

# Serve your frontend application locally.
npm run serve

# Switch to the devnet cluster to deploy there.
solana config set --url devnet
# And update your Anchor.toml file.

# Airdrop yourself some money if necessary.
solana airdrop 5

# Build and deploy to devnet.
anchor build
anchor deploy

# Push your code to the main branch to auto-deploy on Netlify.
git push
```
