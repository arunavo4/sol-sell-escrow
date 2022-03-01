import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { TransactionStatus } from "../types";
import { useLoadingDispatch } from "../contexts/LoadingContext";
import { ActionProps, ModalUserAction } from "../contexts/ModalContext";
import { TransactionType } from "../types";
import { BuyerTab } from "./BuyerTab";
import { Loading } from "./dialogs/Loading";
import { ModalDialog } from "./dialogs/ModalDialog";
import { MyNFT } from "./MyNFT";
import { SearchNFT } from "./SearchNFT";
import { SellerTab } from "./SellerTab";
import { ref, update} from "firebase/database";
import { useProgram } from "../web3/useProgram";
import { cancelOffer } from "../web3/cancelOffer";
import { acceptOffer } from "../web3/acceptOffer";

const colors = {
  active: "text-purple-50 bg-purple-500",
  inactive: "text-gray-500 bg-gray-100",
};

export const Main = ({database} : {database: any}) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const loadingDispatch = useLoadingDispatch();
  const [tab, setTab] = useState(TransactionType.Seller);
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });

  const handleSwitchTab = (type: TransactionType) => () => {
    setTab(type);
  };
  const cancelOfferAction = async ({
    id,
    escrowAccountAddressString,
    nftAddress,
  }: {
    id: string;
    escrowAccountAddressString: string;
    nftAddress: string;
  }) => {
    if (!publicKey || !signTransaction) {
      // TODO: show error
      return;
    }
    loadingDispatch({ type: "SHOW_LOADING" });
    try {
      await cancelOffer({
        wallet: wallet,
        program: program,
        seller: publicKey,
        escrowAccountAddressString,
        nftAddressString: nftAddress,
      });
      update(ref(database, id), {
        status: TransactionStatus.CANCELED,
      });
    } catch (e) {
      console.error(e);
      toast((e as Error).message);
    } finally {
      loadingDispatch({ type: "HIDE_LOADING" });
    }
  };

  const acceptOfferAction = async ({
    id,
    escrowAccountAddressString,
    amount,
    nftAddress,
  }: {
    id: string;
    escrowAccountAddressString: string;
    amount: number;
    nftAddress: string;
  }) => {
    if (!publicKey || !signTransaction) {
      // TODO: show error
      return;
    }
    loadingDispatch({ type: "SHOW_LOADING" });
    try {
      const result = await acceptOffer({
        connection,
        wallet,
        program,
        escrowAccountAddressString,
        buyer: publicKey,
        sellerNFTAddressStr: nftAddress,
      });
      update(ref(database, id), {
        status: TransactionStatus.ACCEPTED,
      });
    } catch (e) {
      console.error(e);
      toast((e as Error).message);
    } finally {
      loadingDispatch({ type: "HIDE_LOADING" });
    }
  };

  const handleConfirm = async (props: ActionProps) => {
    switch (props.type) {
      case ModalUserAction.CancelOffer: {
        return cancelOfferAction({
          id: props.id,
          escrowAccountAddressString: props.escrowAddress,
          nftAddress: props.nftAddress,
        });
      }
      case ModalUserAction.AcceptOffer: {
        return acceptOfferAction({
          id: props.id,
          escrowAccountAddressString: props.escrowAddress,
          amount: props.amount,
          nftAddress: props.nftAddress,
        });
      }
    }
  };

  return (
    <div>
      <MyNFT />
      <SearchNFT />
      <div className="mt-6 sm:mt-6">
        <div className="p-4 sm:px-0 sm:py-3">
          <h3 className="text-lg font-medium  text-gray-900">Transactions</h3>
        </div>
        <div className="px-4 sm:px-0">
          <div className="flex justify-start items-center py-2 gap-2">
            <button
              className={`cursor-pointer py-2 px-4 rounded transition text-center ${
                tab === TransactionType.Seller
                  ? colors["active"]
                  : colors["inactive"]
              }`}
              onClick={handleSwitchTab(TransactionType.Seller)}
            >
              Sell Offers
            </button>
            <button
              className={`cursor-pointer py-2 px-4 rounded transition text-center ${
                tab === TransactionType.Buyer
                  ? colors["active"]
                  : colors["inactive"]
              }`}
              onClick={handleSwitchTab(TransactionType.Buyer)}
            >
              Buy Requests
            </button>
          </div>
          {tab === TransactionType.Seller && <SellerTab database={database}/>}
          {tab === TransactionType.Buyer && <BuyerTab database={database}/>}
        </div>
      </div>
      <ModalDialog onConfirm={handleConfirm} />
      <Loading />
    </div>
  );
};
