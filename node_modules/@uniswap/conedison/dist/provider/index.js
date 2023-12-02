var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { poll } from '@ethersproject/web';
import { getWalletMeta } from './meta';
export * from './meta';
export * from './signing';
function isUniswapWallet(provider) {
    var _a;
    return ((_a = getWalletMeta(provider)) === null || _a === void 0 ? void 0 : _a.name) === 'Uniswap Wallet';
}
/**
 * Sends a transaction, optionally including a gas limit.
 *
 * The ethers sendTransaction implementation first checks the blockNumber, which causes a delay and may inhibit
 * deep-linking behavior on iOS. This wrapper works around that by optionally estimating gas (another source of delay),
 * and by sending the transaction as an unchecked transaction.
 * @see https://docs.walletconnect.com/2.0/swift/guides/mobile-linking#ios-app-link-constraints.
 */
export function sendTransaction(provider, transaction, gasMargin, skipGasLimit) {
    if (gasMargin === void 0) { gasMargin = 0; }
    if (skipGasLimit === void 0) { skipGasLimit = isUniswapWallet(provider); }
    return __awaiter(this, void 0, void 0, function () {
        var signer, gasLimit, hash, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    signer = provider.getSigner();
                    if (!!skipGasLimit) return [3 /*break*/, 2];
                    return [4 /*yield*/, signer.estimateGas(transaction)];
                case 1:
                    gasLimit = _a.sent();
                    if (gasMargin) {
                        gasLimit = gasLimit.add(gasLimit.mul(Math.floor(gasMargin * 100)).div(100));
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, signer.sendUncheckedTransaction(__assign(__assign({}, transaction), { gasLimit: gasLimit }))];
                case 3:
                    hash = _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, poll((function () { return __awaiter(_this, void 0, void 0, function () {
                            var tx;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, provider.getTransaction(hash)];
                                    case 1:
                                        tx = _a.sent();
                                        if (tx === null)
                                            return [2 /*return*/, undefined];
                                        return [2 /*return*/, provider._wrapTransaction(tx, hash)];
                                }
                            });
                        }); }), { oncePoll: provider })];
                case 5: 
                // JSON-RPC only provides an opaque transaction hash, so we poll for the actual transaction.
                // Polling continues until a defined value is returned (see https://docs.ethers.org/v5/api/utils/web/#utils-poll).
                // NB: sendTransaction is a modified version of JsonRpcProvider.sendTransaction - see the original implementation.
                return [2 /*return*/, _a.sent()];
                case 6:
                    error_1 = _a.sent();
                    error_1.transactionHash = hash;
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
