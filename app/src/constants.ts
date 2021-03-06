import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export const feeTokenAccount = new PublicKey(
  process.env.NEXT_PUBLIC_FEE_RECEIVER as string
);
export const feePercentage = new BigNumber(
  process.env.NEXT_PUBLIC_FEE_PERCENTAGE as string,
  10
);
