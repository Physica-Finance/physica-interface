import type { JsonRpcProvider } from '@ethersproject/providers';
import type { ConnectionInfo } from '@ethersproject/web';
import type { Actions } from '@web3-react/types';
import { Connector } from '@web3-react/types';
declare type url = string | ConnectionInfo;
/**
 * @param url - An RPC url or a JsonRpcProvider.
 */
export interface UrlConstructorArgs {
    actions: Actions;
    url: url | JsonRpcProvider;
}
export declare class Url extends Connector {
    /** {@inheritdoc Connector.provider} */
    readonly provider: undefined;
    /** {@inheritdoc Connector.customProvider} */
    customProvider?: JsonRpcProvider;
    private readonly url;
    constructor({ actions, url }: UrlConstructorArgs);
    /** {@inheritdoc Connector.activate} */
    activate(): Promise<void>;
}
export {};
