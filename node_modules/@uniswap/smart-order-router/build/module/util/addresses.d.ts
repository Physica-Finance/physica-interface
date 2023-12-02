import { Token } from '@uniswap/sdk-core';
import { ChainId } from './chains';
export declare const BSC_TICK_LENS_ADDRESS = "0xD9270014D396281579760619CCf4c3af0501A47C";
export declare const BSC_NONFUNGIBLE_POSITION_MANAGER_ADDRESS = "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613";
export declare const BSC_SWAP_ROUTER_02_ADDRESS = "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2";
export declare const BSC_V3_MIGRATOR_ADDRESS = "0x32681814957e0C13117ddc0c2aba232b5c9e760f";
export declare const V3_CORE_FACTORY_ADDRESSES: AddressMap;
export declare const QUOTER_V2_ADDRESSES: AddressMap;
export declare const MIXED_ROUTE_QUOTER_V1_ADDRESSES: AddressMap;
export declare const UNISWAP_MULTICALL_ADDRESSES: AddressMap;
export declare const SWAP_ROUTER_02_ADDRESSES: (chainId: number) => "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2" | "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
export declare const OVM_GASPRICE_ADDRESS = "0x420000000000000000000000000000000000000F";
export declare const ARB_GASINFO_ADDRESS = "0x000000000000000000000000000000000000006C";
export declare const TICK_LENS_ADDRESS = "0xbfd8137f7d1516D3ea5cA83523914859ec47F573";
export declare const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
export declare const V3_MIGRATOR_ADDRESS = "0xA5644E29708357803b5A882D272c41cC0dF92B34";
export declare const MULTICALL2_ADDRESS = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
export declare type AddressMap = {
    [chainId: number]: string;
};
export declare function constructSameAddressMap<T extends string>(address: T, additionalNetworks?: ChainId[]): {
    [chainId: number]: T;
};
export declare const WETH9: {
    [chainId in Exclude<ChainId, ChainId.POLYGON | ChainId.POLYGON_MUMBAI | ChainId.CELO | ChainId.CELO_ALFAJORES | ChainId.GNOSIS | ChainId.MOONBEAM | ChainId.BSC>]: Token;
};
