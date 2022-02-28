/* tslint:disable */
/* eslint-disable */

export type CreateTxHistoryInput = {
  id?: string | null,
  buyerAddress: string,
  sellerAddress: string,
  escrowAddress: string,
  nftAddress: string,
  offeredAmount: number,
  status: TransactionStatus,
  createdAt?: string | null,
};

export enum TransactionStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  CANCELED = "CANCELED",
}

export type TxHistory = {
  __typename: "TxHistory",
  id: string,
  buyerAddress: string,
  sellerAddress: string,
  escrowAddress: string,
  nftAddress: string,
  offeredAmount: number,
  status: TransactionStatus,
  createdAt: string,
  updatedAt: string,
};

export type UpdateTxHistoryInput = {
  id: string,
  buyerAddress?: string | null,
  sellerAddress?: string | null,
  escrowAddress?: string | null,
  nftAddress?: string | null,
  offeredAmount?: number | null,
  status?: TransactionStatus | null,
  createdAt?: string | null,
};

export type DeleteTxHistoryInput = {
  id: string,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export enum TransactionType {
  Seller,
  Buyer,
}

// type Primitive =
//   | string
//   | Function
//   | number
//   | boolean
//   | symbol
//   | undefined
//   | null;

// type DeepOmitArray<T extends any[], K> = {
//   [P in keyof T]: DeepOmit<T[P], K>;
// };
// // https://dev.to/applification/how-to-use-amplify-appsync-graphql-types-in-a-react-typescript-app-of
// export type DeepOmit<T, K> = T extends Primitive
//   ? T
//   : {
//       [P in Exclude<keyof T, K>]: T[P] extends infer TP
//         ? TP extends Primitive
//           ? TP // leave primitives and functions alone
//           : TP extends any[]
//           ? DeepOmitArray<TP, K> // Array special handling
//           : DeepOmit<TP, K>
//         : never;
//     };

// export type TxHistory = Exclude<GetTxHistoryQuery["getTxHistory"], null>;

/*
    Taken from: https://github.com/metaplex-foundation/metaplex/blob/master/js/packages/common/src/actions/metadata.ts
*/
export type StringPublicKey = string;

export const METADATA_PREFIX = "metadata";

export enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7,
}
