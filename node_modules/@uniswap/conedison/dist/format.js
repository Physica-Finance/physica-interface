var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
// Number formatting follows the standards laid out in this spec:
// https://www.notion.so/uniswaplabs/Number-standards-fbb9f533f10e4e22820722c2f66d23c0
var FIVE_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 5,
});
var FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 5,
    minimumFractionDigits: 2,
});
var FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 5,
    minimumFractionDigits: 2,
    useGrouping: false,
});
var THREE_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
});
var THREE_DECIMALS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
});
var THREE_DECIMALS_USD = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
    currency: 'USD',
    style: 'currency',
});
var TWO_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 2,
});
var TWO_DECIMALS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});
var TWO_DECIMALS_USD = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    currency: 'USD',
    style: 'currency',
});
var SHORTHAND_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
var SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
});
var SHORTHAND_FIVE_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 5,
});
var SHORTHAND_USD_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: 'USD',
    style: 'currency',
});
var SHORTHAND_USD_ONE_DECIMAL = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    currency: 'USD',
    style: 'currency',
});
var SIX_SIG_FIGS_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 3,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});
var SIX_SIG_FIGS_NO_COMMAS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumSignificantDigits: 6,
    useGrouping: false,
});
var SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumSignificantDigits: 6,
    minimumSignificantDigits: 3,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    useGrouping: false,
});
var THREE_SIG_FIGS_USD = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 3,
    currency: 'USD',
    style: 'currency',
});
// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
var tokenNonTxFormatter = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.001, formatter: '<0.001' },
    { upperBound: 1, formatter: THREE_DECIMALS },
    { upperBound: 1e6, formatter: TWO_DECIMALS },
    { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS },
    { upperBound: Infinity, formatter: '>999T' },
];
var tokenTxFormatter = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.00001, formatter: '<0.00001' },
    { upperBound: 1, formatter: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN },
    { upperBound: 10000, formatter: SIX_SIG_FIGS_TWO_DECIMALS },
    { upperBound: Infinity, formatter: TWO_DECIMALS },
];
var swapTradeAmountFormatter = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.1, formatter: SIX_SIG_FIGS_NO_COMMAS },
    { upperBound: 1, formatter: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS },
    { upperBound: Infinity, formatter: SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS },
];
var fiatTokenDetailsFormatter = [
    { exact: 0, formatter: '$0.00' },
    { upperBound: 0.00000001, formatter: '<$0.00000001' },
    { upperBound: 0.1, formatter: THREE_SIG_FIGS_USD },
    { upperBound: 1.05, formatter: THREE_DECIMALS_USD },
    { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
    { upperBound: Infinity, formatter: SHORTHAND_USD_TWO_DECIMALS },
];
var fiatTokenPricesFormatter = [
    { exact: 0, formatter: '$0.00' },
    { upperBound: 0.00000001, formatter: '<$0.00000001' },
    { upperBound: 0.1, formatter: THREE_SIG_FIGS_USD },
    { upperBound: 1.05, formatter: THREE_DECIMALS_USD },
    { upperBound: 1000000, formatter: TWO_DECIMALS_USD },
    { upperBound: 1000000000000000, formatter: SHORTHAND_USD_TWO_DECIMALS },
    { upperBound: Infinity, formatter: '>$999T' }, // Use M/B/T abbreviations
];
var fiatTokenStatsFormatter = [
    // if token stat value is 0, we probably don't have the data for it, so show '-' as a placeholder
    { exact: 0, formatter: '-' },
    { upperBound: 0.01, formatter: '<$0.01' },
    { upperBound: 1000, formatter: TWO_DECIMALS_USD },
    { upperBound: Infinity, formatter: SHORTHAND_USD_ONE_DECIMAL },
];
var fiatGasPriceFormatter = [
    { upperBound: 0.01, formatter: '<$0.01' },
    { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
    { upperBound: Infinity, formatter: SHORTHAND_USD_TWO_DECIMALS },
];
var fiatTokenQuantityFormatter = __spreadArray([{ exact: 0, formatter: '$0.00' }], __read(fiatGasPriceFormatter), false);
var portfolioBalanceFormatter = [
    { exact: 0, formatter: '$0.00' },
    { upperBound: Infinity, formatter: TWO_DECIMALS_USD },
];
var ntfTokenFloorPriceFormatterTrailingZeros = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.001, formatter: '<0.001' },
    { upperBound: 1, formatter: THREE_DECIMALS },
    { upperBound: 1000, formatter: TWO_DECIMALS },
    { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS },
    { upperBound: Infinity, formatter: '>999T' },
];
var ntfTokenFloorPriceFormatter = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.001, formatter: '<0.001' },
    { upperBound: 1, formatter: THREE_DECIMALS_NO_TRAILING_ZEROS },
    { upperBound: 1000, formatter: TWO_DECIMALS_NO_TRAILING_ZEROS },
    { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS },
    { upperBound: Infinity, formatter: '>999T' },
];
var ntfCollectionStatsFormatter = [
    { exact: 0, formatter: '0' },
    { upperBound: 0.00001, formatter: '<0.00001' },
    { upperBound: 1, formatter: FIVE_DECIMALS_NO_TRAILING_ZEROS },
    { upperBound: 1e6, formatter: SIX_SIG_FIGS_NO_COMMAS },
    { upperBound: 1e15, formatter: SHORTHAND_FIVE_DECIMALS_NO_TRAILING_ZEROS },
    { upperBound: Infinity, formatter: '>999T' },
];
export var NumberType;
(function (NumberType) {
    // used for token quantities in non-transaction contexts (e.g. portfolio balances)
    NumberType["TokenNonTx"] = "token-non-tx";
    // used for token quantities in transaction contexts (e.g. swap, send)
    NumberType["TokenTx"] = "token-tx";
    // this formatter is only used for displaying the swap trade output amount
    // in the text input boxes. Output amounts on review screen should use the above TokenTx formatter
    NumberType["SwapTradeAmount"] = "swap-trade-amount";
    // fiat prices in any component that belongs in the Token Details flow (except for token stats)
    NumberType["FiatTokenDetails"] = "fiat-token-details";
    // fiat prices everywhere except Token Details flow
    NumberType["FiatTokenPrice"] = "fiat-token-price";
    // fiat values for market cap, TVL, volume in the Token Details screen
    NumberType["FiatTokenStats"] = "fiat-token-stats";
    // fiat price of token balances
    NumberType["FiatTokenQuantity"] = "fiat-token-quantity";
    // fiat gas prices
    NumberType["FiatGasPrice"] = "fiat-gas-price";
    // portfolio balance
    NumberType["PortfolioBalance"] = "portfolio-balance";
    // nft floor price denominated in a token (e.g, ETH)
    NumberType["NFTTokenFloorPrice"] = "nft-token-floor-price";
    // nft collection stats like number of items, holder, and sales
    NumberType["NFTCollectionStats"] = "nft-collection-stats";
    // nft floor price with trailing zeros
    NumberType["NFTTokenFloorPriceTrailingZeros"] = "nft-token-floor-price-trailing-zeros";
})(NumberType || (NumberType = {}));
var TYPE_TO_FORMATTER_RULES = (_a = {},
    _a[NumberType.TokenNonTx] = tokenNonTxFormatter,
    _a[NumberType.TokenTx] = tokenTxFormatter,
    _a[NumberType.SwapTradeAmount] = swapTradeAmountFormatter,
    _a[NumberType.FiatTokenQuantity] = fiatTokenQuantityFormatter,
    _a[NumberType.FiatTokenDetails] = fiatTokenDetailsFormatter,
    _a[NumberType.FiatTokenPrice] = fiatTokenPricesFormatter,
    _a[NumberType.FiatTokenStats] = fiatTokenStatsFormatter,
    _a[NumberType.FiatGasPrice] = fiatGasPriceFormatter,
    _a[NumberType.PortfolioBalance] = portfolioBalanceFormatter,
    _a[NumberType.NFTTokenFloorPrice] = ntfTokenFloorPriceFormatter,
    _a[NumberType.NFTTokenFloorPriceTrailingZeros] = ntfTokenFloorPriceFormatterTrailingZeros,
    _a[NumberType.NFTCollectionStats] = ntfCollectionStatsFormatter,
    _a);
function getFormatterRule(input, type) {
    var rules = TYPE_TO_FORMATTER_RULES[type];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if ((rule.exact !== undefined && input === rule.exact) ||
            (rule.upperBound !== undefined && input < rule.upperBound)) {
            return rule.formatter;
        }
    }
    throw new Error("formatter for type ".concat(type, " not configured correctly"));
}
export function formatNumber(input, type, placeholder) {
    if (type === void 0) { type = NumberType.TokenNonTx; }
    if (placeholder === void 0) { placeholder = '-'; }
    if (input === null || input === undefined) {
        return placeholder;
    }
    var formatter = getFormatterRule(input, type);
    if (typeof formatter === 'string')
        return formatter;
    return formatter.format(input);
}
export function formatCurrencyAmount(amount, type, placeholder) {
    if (type === void 0) { type = NumberType.TokenNonTx; }
    return formatNumber(amount ? parseFloat(amount.toSignificant()) : undefined, type, placeholder);
}
export function formatPriceImpact(priceImpact) {
    if (!priceImpact)
        return '-';
    return "".concat(priceImpact.multiply(-1).toFixed(3), "%");
}
export function formatPrice(price, type) {
    if (type === void 0) { type = NumberType.FiatTokenPrice; }
    if (price === null || price === undefined) {
        return '-';
    }
    return formatNumber(parseFloat(price.toSignificant()), type);
}
/**
 * Very simple date formatter
 * Feel free to add more options / adapt to your needs.
 */
export function formatDate(date) {
    return date.toLocaleString('en-US', {
        day: 'numeric',
        year: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric', // numeric, 2-digit
    });
}
export function formatNumberOrString(price, type) {
    if (price === null || price === undefined)
        return '-';
    if (typeof price === 'string')
        return formatNumber(parseFloat(price), type);
    return formatNumber(price, type);
}
export function formatUSDPrice(price, type) {
    if (type === void 0) { type = NumberType.FiatTokenPrice; }
    return formatNumberOrString(price, type);
}
