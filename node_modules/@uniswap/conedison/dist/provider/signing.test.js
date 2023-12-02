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
import { JsonRpcProvider } from '@ethersproject/providers';
import { signTypedData } from '../provider';
describe('signing', function () {
    describe('signTypedData', function () {
        var wallet = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826';
        var domain = {
            name: 'Ether Mail',
            version: '1',
            chainId: '1',
            verifyingContract: '0xcccccccccccccccccccccccccccccccccccccccc',
        };
        var types = {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' },
            ],
            Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' },
            ],
        };
        var value = {
            from: {
                name: 'Cow',
                wallet: wallet,
            },
            to: {
                name: 'Bob',
                wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            },
            contents: 'Hello, Bob!',
        };
        var signer;
        beforeEach(function () {
            signer = new JsonRpcProvider().getSigner();
            jest.spyOn(signer, 'getAddress').mockResolvedValue(wallet);
        });
        function itFallsBackToEthSignIfUnimplemented(signingMethod) {
            var _this = this;
            it.each(['not found', 'not implemented'])("falls back to eth_sign if ".concat(signingMethod, " is %s"), function (message) { return __awaiter(_this, void 0, void 0, function () {
                var send, hash;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            send = jest
                                .spyOn(signer.provider, 'send')
                                .mockImplementationOnce(function (method) {
                                if (method === signingMethod)
                                    return Promise.reject({ message: "method ".concat(message) });
                                throw new Error('Unimplemented');
                            })
                                .mockImplementationOnce(function (method, params) {
                                if (method === 'eth_sign')
                                    return Promise.resolve();
                                throw new Error('Unimplemented');
                            });
                            jest.spyOn(console, 'warn').mockImplementation(function () { return undefined; });
                            return [4 /*yield*/, signTypedData(signer, domain, types, value)];
                        case 1:
                            _b.sent();
                            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('signTypedData: wallet does not implement EIP-712, falling back to eth_sign'), expect.anything());
                            expect(send).toHaveBeenCalledTimes(2);
                            expect(send).toHaveBeenCalledWith(signingMethod, [wallet, expect.anything()]);
                            expect(send).toHaveBeenCalledWith('eth_sign', [wallet, expect.anything()]);
                            hash = (_a = send.mock.lastCall[1]) === null || _a === void 0 ? void 0 : _a[1];
                            expect(hash).toBe('0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2');
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        function itFailsIfRejected(signingMethod) {
            var _this = this;
            it('fails if rejected', function () { return __awaiter(_this, void 0, void 0, function () {
                var send, data;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            send = jest.spyOn(signer.provider, 'send').mockImplementationOnce(function (method) {
                                if (method === signingMethod)
                                    return Promise.reject(new Error('User rejected'));
                                throw new Error('Unimplemented');
                            });
                            return [4 /*yield*/, expect(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, signTypedData(signer, domain, types, value)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); }).rejects.toThrow('User rejected')];
                        case 1:
                            _b.sent();
                            expect(send).toHaveBeenCalledTimes(1);
                            expect(send).toHaveBeenCalledWith(signingMethod, [wallet, expect.anything()]);
                            data = (_a = send.mock.lastCall[1]) === null || _a === void 0 ? void 0 : _a[1];
                            expect(JSON.parse(data)).toEqual(expect.objectContaining({ domain: domain, message: value }));
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        it('signs using eth_signTypedData_v4', function () { return __awaiter(void 0, void 0, void 0, function () {
            var send, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        send = jest.spyOn(signer.provider, 'send').mockImplementationOnce(function (method, params) {
                            if (method === 'eth_signTypedData_v4')
                                return Promise.resolve();
                            throw new Error('Unimplemented');
                        });
                        return [4 /*yield*/, signTypedData(signer, domain, types, value)];
                    case 1:
                        _b.sent();
                        expect(send).toHaveBeenCalledTimes(1);
                        expect(send).toHaveBeenCalledWith('eth_signTypedData_v4', [wallet, expect.anything()]);
                        data = (_a = send.mock.lastCall[1]) === null || _a === void 0 ? void 0 : _a[1];
                        expect(JSON.parse(data)).toEqual(expect.objectContaining({ domain: domain, message: value }));
                        return [2 /*return*/];
                }
            });
        }); });
        itFallsBackToEthSignIfUnimplemented('eth_signTypedData_v4');
        itFailsIfRejected('eth_signTypedData_v4');
        describe('wallets which do not support eth_signTypedData_v4', function () {
            describe.each(['SafePal Wallet', 'Ledger Wallet Connect'])('%s', function (name) {
                beforeEach(function () {
                    var web3Provider = signer.provider;
                    web3Provider.provider = { isWalletConnect: true, connector: { peerMeta: { name: name } } };
                });
                it('signs using eth_signTypedData', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var send, data;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                send = jest.spyOn(signer.provider, 'send').mockImplementationOnce(function (method, params) {
                                    if (method === 'eth_signTypedData')
                                        return Promise.resolve();
                                    throw new Error('Unimplemented');
                                });
                                return [4 /*yield*/, signTypedData(signer, domain, types, value)];
                            case 1:
                                _b.sent();
                                expect(send).toHaveBeenCalledTimes(1);
                                expect(send).toHaveBeenCalledWith('eth_signTypedData', [wallet, expect.anything()]);
                                data = (_a = send.mock.lastCall[1]) === null || _a === void 0 ? void 0 : _a[1];
                                expect(JSON.parse(data)).toEqual(expect.objectContaining({ domain: domain, message: value }));
                                return [2 /*return*/];
                        }
                    });
                }); });
                itFallsBackToEthSignIfUnimplemented('eth_signTypedData');
                itFailsIfRejected('eth_signTypedData');
            });
        });
    });
});
