import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionType } from "../types";
import { Transactions } from "./Transactions";

export const SellerTab = ({database} : {database: any}) => {
  const { publicKey } = useWallet();
  const [items, fetch] = useTransactions(TransactionType.Seller, database);

  useEffect(() => {
    const abortController = new AbortController();

    if (publicKey) {
      try {
        fetch(publicKey.toBase58());
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.log(error);
        }
      }
    }

    return () => {
      abortController.abort();
    };
  }, [fetch, publicKey]);

  return <Transactions items={items} type={TransactionType.Seller} />;
};
