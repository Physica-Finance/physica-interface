"use strict";
/**
 * This test intentionally runs in the jest environment, so it will fail to link hardhat's asm dependency.
 * This is expected, and necessary in order to collect coverage and test that derived accounts match hardhat's.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const accounts_1 = require("./accounts");
describe('toExternallyOwnedAccounts', () => {
    describe('with an HD wallet', () => {
        const ACCOUNTS = {
            initialIndex: 1,
            count: 2,
            path: "m/44'/60'/0'/1",
            passphrase: 'passphrase',
            mnemonic: 'test test test test test test test test test test test junk',
            accountsBalance: '10000000000000000000000',
        };
        it('matches hardhat test addresses', () => __awaiter(void 0, void 0, void 0, function* () {
            hardhat_1.default.network.config.accounts = ACCOUNTS;
            const addresses = yield hardhat_1.default.network.provider.send('eth_accounts', []);
            expect(addresses).toEqual((0, accounts_1.toExternallyOwnedAccounts)(ACCOUNTS).map(({ address }) => address));
        }));
        it('ignores trailing slash', () => {
            expect((0, accounts_1.toExternallyOwnedAccounts)(ACCOUNTS)).toEqual((0, accounts_1.toExternallyOwnedAccounts)(Object.assign(Object.assign({}, ACCOUNTS), { path: ACCOUNTS.path + '/' })));
        });
    });
    describe('with private keys', () => {
        const ACCOUNTS = [
            {
                privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
                balance: '10000000000000000000000',
            },
            {
                privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
                balance: '10000000000000000000000',
            },
        ];
        const ADDRESSES = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'];
        it('derives the public addresses', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(ADDRESSES).toEqual((0, accounts_1.toExternallyOwnedAccounts)(ACCOUNTS).map(({ address }) => address));
        }));
    });
});
