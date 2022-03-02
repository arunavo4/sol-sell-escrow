import { TxHistory, TransactionStatus } from "../types";
import { ModalUserAction, useModalDispatch } from "../contexts/ModalContext";
import { TransactionType } from "../types";

interface TransactionProps {
  txHistory: TxHistory;
  type: TransactionType;
}

const shortAddress = (address: string) => {
  return address.slice(0, 3) + ".." + address.slice(-4);
};

const StatusLogo = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case TransactionStatus.ACCEPTED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Accepted
          </span>
        </td>
      );
    case TransactionStatus.CANCELED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
            Canceled
          </span>
        </td>
      );
    case TransactionStatus.REQUESTED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Requested
          </span>
        </td>
      );
  }
};

interface ActionButtonProps {
  onClickDiscard: () => any;
  onClickAccept: () => any;
  status: TransactionStatus;
  type: TransactionType;
}
const ActionButton = ({ onClickDiscard, onClickAccept, type, status }: ActionButtonProps) => {
  if (
    type === TransactionType.Seller &&
    status === TransactionStatus.REQUESTED
  ) {
    return (
      <button
        className="text-indigo-600 hover:text-indigo-900"
        onClick={onClickDiscard}
      >
        Discard
      </button>
    );
  }
  if (
    type === TransactionType.Buyer &&
    status === TransactionStatus.REQUESTED
  ) {
    return (
      <div>
        <button
          className="text-indigo-600 hover:text-indigo-900 pr-2"
          onClick={onClickAccept}
        >
          Accept
        </button>
        <button
          className="text-indigo-600 hover:text-indigo-900 pl-2"
          onClick={onClickDiscard}
        >
          Discard
        </button>
      </div>
    );
  }
  return (
    <div className="w-16 whitespace-nowrap text-center text-sm text-gray-500">
      -
    </div>
  );
};

const AddressLink = ({ address }: { address: string }) => {
  return (
    <a
      href={`https://explorer.solana.com/address/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {shortAddress(address)}
    </a>
  );
};

export const Transaction = ({ txHistory, type }: TransactionProps) => {
  const dispatch = useModalDispatch();
  const date = new Date(txHistory.createdAt);

  const handleClickDiscard = () => {
    dispatch({
      type: "SHOW_DIALOG",
      input: {
        buttonName: "Discard Offer",
        message: `This will discard your request for NFT:\n${txHistory.nftAddress}`,
        title: "Discard Offer",
        props: {
          type: ModalUserAction.CancelOffer,
          id: txHistory.id,
          escrowAddress: txHistory.escrowAddress,
          sellerAddress: txHistory.sellerAddress,
          buyerAddress: txHistory.buyerAddress,
          nftAddress: txHistory.nftAddress,
        },
      },
    });
  };

  const handleClickAccept = () => {
    dispatch({
      type: "SHOW_DIALOG",
      input: {
        buttonName: "Accept Offer",
        message: `Do you want to accept an offer for NFT:\n${txHistory.nftAddress}`,
        title: "Accept Offer",
        props: {
          type: ModalUserAction.AcceptOffer,
          id: txHistory.id,
          escrowAddress: txHistory.escrowAddress,
          amount: txHistory.offeredAmount,
          sellerAddress: txHistory.sellerAddress,
          buyerAddress: txHistory.buyerAddress,
          nftAddress: txHistory.nftAddress,
        },
      },
    });
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:text-gray-900">
        <AddressLink address={txHistory.buyerAddress} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <AddressLink address={txHistory.sellerAddress} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <AddressLink address={txHistory.nftAddress} />
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        {txHistory.offeredAmount}
      </td>
      <StatusLogo status={txHistory.status} />
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
        {date.toLocaleString()}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButton
          type={type}
          status={txHistory.status}
          onClickAccept={handleClickAccept}
          onClickDiscard={handleClickDiscard}
        />
      </td>
    </tr>
  );
};
