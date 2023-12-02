import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import type { JsonRpcSigner } from '@ethersproject/providers';
/**
 * Signs TypedData with EIP-712, if available, or else by falling back to eth_sign.
 * Calls eth_signTypedData_v4, or eth_signTypedData for wallets with incomplete EIP-712 support.
 *
 * @see https://github.com/ethers-io/ethers.js/blob/c80fcddf50a9023486e9f9acb1848aba4c19f7b6/packages/providers/src.ts/json-rpc-provider.ts#L334
 */
export declare function signTypedData(signer: JsonRpcSigner, domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<any>;
