import type { JsonRpcProvider } from '@ethersproject/providers';
/**
 * @param providers - An array of providers to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
export declare function getBestProvider(providers: JsonRpcProvider[], timeout?: number): Promise<JsonRpcProvider>;
