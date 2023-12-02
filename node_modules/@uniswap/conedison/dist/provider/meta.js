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
function isWeb3Provider(provider) {
    return 'provider' in provider;
}
function isWalletConnectProvider(provider) {
    return provider.isWalletConnect;
}
export var WalletType;
(function (WalletType) {
    WalletType["WALLET_CONNECT"] = "WalletConnect";
    WalletType["INJECTED"] = "Injected";
})(WalletType || (WalletType = {}));
function getWalletConnectMeta(provider) {
    var _a;
    var metadata;
    if ('session' in provider) {
        metadata = (_a = provider.session) === null || _a === void 0 ? void 0 : _a.peer.metadata;
    }
    else {
        metadata = provider.connector.peerMeta;
    }
    return __assign({ type: WalletType.WALLET_CONNECT, agent: metadata ? "".concat(metadata.name, " (WalletConnect)") : '(WalletConnect)' }, metadata);
}
function getInjectedMeta(provider) {
    var _a;
    var properties = Object.getOwnPropertyNames(provider);
    var names = (_a = properties
        .filter(function (name) { return name.match(/^is.*$/) && provider[name] === true; })
        .map(function (name) { return name.slice(2); })) !== null && _a !== void 0 ? _a : [];
    // Many wallets spoof MetaMask by setting `isMetaMask` along with their own identifier,
    // so we sort MetaMask last so that these wallets' names come first.
    names.sort(function (a, b) { return (a === 'MetaMask' ? 1 : b === 'MetaMask' ? -1 : 0); });
    // Coinbase Wallet can be connected through an extension or a QR code, with `qrUrl` as the only differentiator,
    // so we capture `qrUrl` in the agent string.
    if (properties.includes('qrUrl') && provider['qrUrl']) {
        names.push('qrUrl');
    }
    return {
        type: WalletType.INJECTED,
        agent: __spreadArray(__spreadArray([], __read(names), false), ['(Injected)'], false).join(' '),
        name: names[0],
        // TODO(WEB-2914): Populate description, url, and icons for known wallets.
    };
}
export function getWalletMeta(provider) {
    if (!isWeb3Provider(provider))
        return undefined;
    if (isWalletConnectProvider(provider.provider)) {
        return getWalletConnectMeta(provider.provider);
    }
    else {
        return getInjectedMeta(provider.provider);
    }
}
