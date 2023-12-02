import type { JsonRpcProvider } from '@ethersproject/providers';
import type { ConnectionInfo } from '@ethersproject/web';
import type { Actions } from '@web3-react/types';
import { Connector } from '@web3-react/types';
declare type url = string | ConnectionInfo;
/**
 * @param urlMap - A mapping from chainIds to RPC urls.
 * @param defaultChainId - The chainId to connect to in activate if one is not provided.
 * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
 * online providers.
 */
export interface NetworkConstructorArgs {
    actions: Actions;
    urlMap: {
        [chainId: number]: url | url[] | JsonRpcProvider | JsonRpcProvider[];
    };
    defaultChainId?: number;
    timeout?: number;
}
export declare class Network extends Connector {
    /** {@inheritdoc Connector.provider} */
    readonly provider: undefined;
    /** {@inheritdoc Connector.customProvider} */
    customProvider?: JsonRpcProvider;
    private readonly providerCache;
    private readonly urlMap;
    private readonly defaultChainId;
    private readonly timeout;
    constructor({ actions, urlMap, defaultChainId, timeout, }: NetworkConstructorArgs);
    private isomorphicInitialize;
    /**
     * Initiates a connection.
     *
     * @param desiredChainId - The desired chain to connect to.
     */
    activate(desiredChainId?: number): Promise<void>;
}
export {};
