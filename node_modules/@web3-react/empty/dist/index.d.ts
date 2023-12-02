import { Connector } from '@web3-react/types';
export declare class Empty extends Connector {
    /** {@inheritdoc Connector.provider} */
    provider: undefined;
    /**
     * No-op. May be called if it simplifies application code.
     */
    activate(): void;
}
export declare const EMPTY: Empty;
