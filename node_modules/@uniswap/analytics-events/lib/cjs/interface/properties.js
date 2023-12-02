"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskCheckResult = exports.WalletConnectionResult = exports.NavBarSearchTypes = void 0;
/** Known navbar search result types */
var NavBarSearchTypes;
(function (NavBarSearchTypes) {
    NavBarSearchTypes["COLLECTION_SUGGESTION"] = "collection-suggestion";
    NavBarSearchTypes["COLLECTION_TRENDING"] = "collection-trending";
    NavBarSearchTypes["RECENT_SEARCH"] = "recent";
    NavBarSearchTypes["TOKEN_SUGGESTION"] = "token-suggestion";
    NavBarSearchTypes["TOKEN_TRENDING"] = "token-trending";
})(NavBarSearchTypes = exports.NavBarSearchTypes || (exports.NavBarSearchTypes = {}));
var WalletConnectionResult;
(function (WalletConnectionResult) {
    WalletConnectionResult["FAILED"] = "Failed";
    WalletConnectionResult["SUCCEEDED"] = "Succeeded";
})(WalletConnectionResult = exports.WalletConnectionResult || (exports.WalletConnectionResult = {}));
var RiskCheckResult;
(function (RiskCheckResult) {
    RiskCheckResult["FAILED"] = "Failed";
    RiskCheckResult["PASSED"] = "Passed";
})(RiskCheckResult = exports.RiskCheckResult || (exports.RiskCheckResult = {}));
