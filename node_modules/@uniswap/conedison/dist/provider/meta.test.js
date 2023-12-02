var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { JsonRpcProvider } from '@ethersproject/providers';
import { getWalletMeta, WalletType } from './meta';
var MockJsonRpcProvider = /** @class */ (function (_super) {
    __extends(MockJsonRpcProvider, _super);
    function MockJsonRpcProvider(arg) {
        var _this = _super.call(this) || this;
        _this.name = 'JsonRpcProvider';
        _this.arg = JSON.stringify(arg);
        return _this;
    }
    return MockJsonRpcProvider;
}(JsonRpcProvider));
var WC_META = { name: 'name', description: 'description', url: 'url', icons: [] };
var MockWalletConnectProviderV1 = /** @class */ (function (_super) {
    __extends(MockWalletConnectProviderV1, _super);
    function MockWalletConnectProviderV1(peerMeta) {
        var _this = _super.call(this, peerMeta) || this;
        _this.name = WalletType.WALLET_CONNECT;
        _this.provider = { isWalletConnect: true, connector: { peerMeta: peerMeta } };
        return _this;
    }
    return MockWalletConnectProviderV1;
}(MockJsonRpcProvider));
var MockWalletConnectProviderV2 = /** @class */ (function (_super) {
    __extends(MockWalletConnectProviderV2, _super);
    function MockWalletConnectProviderV2(metadata) {
        var _this = _super.call(this, metadata) || this;
        _this.name = WalletType.WALLET_CONNECT;
        _this.provider = { isWalletConnect: true, session: { peer: { metadata: metadata } } };
        return _this;
    }
    return MockWalletConnectProviderV2;
}(MockJsonRpcProvider));
var MockInjectedProvider = /** @class */ (function (_super) {
    __extends(MockInjectedProvider, _super);
    function MockInjectedProvider(provider) {
        var _this = _super.call(this, provider) || this;
        _this.name = WalletType.INJECTED;
        _this.provider = __assign({ isConnected: function () {
                return true;
            } }, provider);
        return _this;
    }
    return MockInjectedProvider;
}(MockJsonRpcProvider));
var testCases = [
    [new MockJsonRpcProvider(), undefined],
    [new MockWalletConnectProviderV1(null), { type: WalletType.WALLET_CONNECT, agent: '(WalletConnect)' }],
    [
        new MockWalletConnectProviderV1(WC_META),
        __assign({ type: WalletType.WALLET_CONNECT, agent: 'name (WalletConnect)' }, WC_META),
    ],
    [new MockWalletConnectProviderV2(null), { type: WalletType.WALLET_CONNECT, agent: '(WalletConnect)' }],
    [
        new MockWalletConnectProviderV2(WC_META),
        __assign({ type: WalletType.WALLET_CONNECT, agent: 'name (WalletConnect)' }, WC_META),
    ],
    [new MockInjectedProvider({}), { type: WalletType.INJECTED, agent: '(Injected)', name: undefined }],
    [
        new MockInjectedProvider({ isMetaMask: false }),
        { type: WalletType.INJECTED, agent: '(Injected)', name: undefined },
    ],
    [
        new MockInjectedProvider({ isMetaMask: true }),
        { type: WalletType.INJECTED, agent: 'MetaMask (Injected)', name: 'MetaMask' },
    ],
    [
        new MockInjectedProvider({ isTest: true, isMetaMask: true }),
        { type: WalletType.INJECTED, agent: 'Test MetaMask (Injected)', name: 'Test' },
    ],
    [
        new MockInjectedProvider({ isCoinbaseWallet: true, qrUrl: undefined }),
        { type: WalletType.INJECTED, agent: 'CoinbaseWallet (Injected)', name: 'CoinbaseWallet' },
    ],
    [
        new MockInjectedProvider({ isCoinbaseWallet: true, qrUrl: true }),
        { type: WalletType.INJECTED, agent: 'CoinbaseWallet qrUrl (Injected)', name: 'CoinbaseWallet' },
    ],
    [
        new MockInjectedProvider({ isA: true, isB: false }),
        { type: WalletType.INJECTED, agent: 'A (Injected)', name: 'A' },
    ],
    [
        new MockInjectedProvider({ isA: true, isB: true }),
        { type: WalletType.INJECTED, agent: 'A B (Injected)', name: 'A' },
    ],
];
describe('meta', function () {
    describe.each(testCases)('getWalletMeta/getWalletName returns the project meta/name', function (provider, meta) {
        it("".concat(provider === null || provider === void 0 ? void 0 : provider.name, " ").concat(provider.arg), function () {
            expect(getWalletMeta(provider)).toEqual(meta);
        });
    });
});
