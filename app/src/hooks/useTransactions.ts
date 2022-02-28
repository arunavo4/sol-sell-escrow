import { useState } from "react";
import {
  TxHistory,
} from "../types";
import { TransactionType } from "../types";
import { ref, get, query, equalTo, orderByChild } from "firebase/database";

export const useTransactions = (
  type: TransactionType,
  database: any
): [TxHistory[] | null, (address: string) => Promise<void>] => {
  const [transactions, setTransactions] = useState<TxHistory[] | null>(null);
  async function fetchBuyerTransactions(address: string) {
    try {
      if (address) {
        const getTxHistoryByBuyerAddr = query(ref(database), orderByChild("buyerAddress"), equalTo(address));
        await get(getTxHistoryByBuyerAddr).then((snapshot) => {
            if (snapshot.exists()) {
                const TxHistoryData: TxHistory[] = snapshot.val();
                var sortedTxHistoryData = [];
                console.log(TxHistoryData);
                
                for (var id in TxHistoryData) {
                  sortedTxHistoryData.push(TxHistoryData[id]);
                }
                sortedTxHistoryData.sort((a: TxHistory, b: TxHistory): number => {
                    // Convert string dates into `Date` objects
                    const date1: Date = new Date(a["updatedAt"] || a["createdAt"]);
                    const date2: Date = new Date(b["updatedAt"] || b["createdAt"]);
                    
                    return date2.valueOf() - date1.valueOf(); // DECREASING ORDER
                });
                const items = (sortedTxHistoryData || []) as TxHistory[];
                if (items.length !== 0) {
                  setTransactions(items);
                }
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
      }
    } catch (err) {
      console.log("error fetching buyer tx", err);
    }
  }
  async function fetchSellerTransactions(address: string) {
    try {
      if (address) {
        const getTxHistoryBySellerAddr = query(ref(database), orderByChild("sellerAddress"), equalTo(address));
        await get(getTxHistoryBySellerAddr).then((snapshot) => {
            if (snapshot.exists()) {
                const TxHistoryData = snapshot.val();
                var sortedTxHistoryData = [];
                console.log(TxHistoryData);
                
                for (var id in TxHistoryData) {
                  sortedTxHistoryData.push(TxHistoryData[id]);
                }
                sortedTxHistoryData.sort((a: TxHistory, b: TxHistory): number => {
                    // Convert string dates into `Date` objects
                    const date1: Date = new Date(a["updatedAt"] || a["createdAt"]);
                    const date2: Date = new Date(b["updatedAt"] || b["createdAt"]);
                    
                    return date2.valueOf() - date1.valueOf(); // DECREASING ORDER
                });
                
                const items = (sortedTxHistoryData || []) as TxHistory[];
                if (items.length !== 0) {
                  setTransactions(items);
                }
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
      }
    } catch (err) {
      console.log("error fetching seller tx", err);
    }
  }
  switch (type) {
    case TransactionType.Buyer:
      return [transactions, fetchBuyerTransactions];
    case TransactionType.Seller:
      return [transactions, fetchSellerTransactions];
    default:
      throw new Error("TranasactionType is missing");
  }
};
