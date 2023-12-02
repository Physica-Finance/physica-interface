import type { JsonRpcProvider } from '@ethersproject/providers';
export declare enum WalletType {
    WALLET_CONNECT = "WalletConnect",
    INJECTED = "Injected"
}
/**
 * WalletMeta for WalletConnect or Injected wallets.
 *
 * For WalletConnect wallets, name, description, url, and icons are taken from WalletConnect's peerMeta
 * v1: @see https://docs.walletconnect.com/1.0/specs#session-request
 * v2: @see https://docs.walletconnect.com/2.0/specs/clients/core/pairing/data-structures#metadata
 *
 * For Injected wallets, the name is derived from the `is*` properties on the provider (eg `isCoinbaseWallet`).
 */
export interface WalletMeta {
    type: WalletType;
    /**
     * The agent string of the wallet, for use with analytics/debugging.
     * Denotes the wallet's provenance - analagous to a User String - including all `is*` properties and the type.
     *
     * Some injected wallets are used different ways (eg with/without spoofing MetaMask).
     * The agent will capture these differences, while the name will not.
     *
     * @example 'CoinbaseWallet qUrl (Injected)'
     */
    agent: string;
    /**
     * The name of the wallet, for use with UI.
     *
     * @example 'CoinbaseWallet'
     */
    name?: string;
    description?: string;
    url?: string;
    icons?: string[];
}
export declare function getWalletMeta(provider: JsonRpcProvider): WalletMeta | undefined;
