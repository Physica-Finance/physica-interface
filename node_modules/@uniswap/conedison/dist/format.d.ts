import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core';
import { Nullish } from './types';
export declare enum NumberType {
    TokenNonTx = "token-non-tx",
    TokenTx = "token-tx",
    SwapTradeAmount = "swap-trade-amount",
    FiatTokenDetails = "fiat-token-details",
    FiatTokenPrice = "fiat-token-price",
    FiatTokenStats = "fiat-token-stats",
    FiatTokenQuantity = "fiat-token-quantity",
    FiatGasPrice = "fiat-gas-price",
    PortfolioBalance = "portfolio-balance",
    NFTTokenFloorPrice = "nft-token-floor-price",
    NFTCollectionStats = "nft-collection-stats",
    NFTTokenFloorPriceTrailingZeros = "nft-token-floor-price-trailing-zeros"
}
export declare function formatNumber(input: Nullish<number>, type?: NumberType, placeholder?: string): string;
export declare function formatCurrencyAmount(amount: Nullish<CurrencyAmount<Currency>>, type?: NumberType, placeholder?: string): string;
export declare function formatPriceImpact(priceImpact: Percent | undefined): string;
export declare function formatPrice(price: Nullish<Price<Currency, Currency>>, type?: NumberType): string;
/**
 * Very simple date formatter
 * Feel free to add more options / adapt to your needs.
 */
export declare function formatDate(date: Date): string;
export declare function formatNumberOrString(price: Nullish<number | string>, type: NumberType): string;
export declare function formatUSDPrice(price: Nullish<number | string>, type?: NumberType): string;
