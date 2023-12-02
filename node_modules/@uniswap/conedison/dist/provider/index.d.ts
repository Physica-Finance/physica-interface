import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import { JsonRpcProvider } from '@ethersproject/providers';
export * from './meta';
export * from './signing';
/**
 * Sends a transaction, optionally including a gas limit.
 *
 * The ethers sendTransaction implementation first checks the blockNumber, which causes a delay and may inhibit
 * deep-linking behavior on iOS. This wrapper works around that by optionally estimating gas (another source of delay),
 * and by sending the transaction as an unchecked transaction.
 * @see https://docs.walletconnect.com/2.0/swift/guides/mobile-linking#ios-app-link-constraints.
 */
export declare function sendTransaction(provider: JsonRpcProvider, transaction: Deferrable<TransactionRequest>, gasMargin?: number, skipGasLimit?: boolean): Promise<TransactionResponse>;
