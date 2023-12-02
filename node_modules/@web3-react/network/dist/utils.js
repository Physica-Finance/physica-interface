"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestProvider = void 0;
/**
 * @param providers - An array of providers to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
function getBestProvider(providers, timeout = 5000) {
    return __awaiter(this, void 0, void 0, function* () {
        // if we only have 1 provider, it's the best!
        if (providers.length === 1)
            return providers[0];
        // the below returns the first provider for which there's been a successful call, prioritized by index
        return new Promise((resolve) => {
            let resolved = false;
            const successes = {};
            providers.forEach((provider, i) => {
                // create a promise that resolves on a successful call, and rejects on a failed call or after timeout milliseconds
                const promise = new Promise((resolve, reject) => {
                    provider
                        .getNetwork()
                        .then(() => resolve())
                        .catch(() => reject());
                    // set a timeout to reject
                    setTimeout(() => {
                        reject();
                    }, timeout);
                });
                void promise
                    .then(() => true)
                    .catch(() => false)
                    .then((success) => {
                    // if we already resolved, return
                    if (resolved)
                        return;
                    // store the result of the call
                    successes[i] = success;
                    // if this is the last call and we haven't resolved yet - do so
                    if (Object.keys(successes).length === providers.length) {
                        const index = Object.keys(successes).findIndex((j) => successes[Number(j)]);
                        // no need to set resolved to true, as this is the last promise
                        return resolve(providers[index === -1 ? 0 : index]);
                    }
                    // otherwise, for each prospective index, check if we can resolve
                    new Array(providers.length).fill(0).forEach((_, prospectiveIndex) => {
                        // to resolve, we need to:
                        // a) have successfully made a call
                        // b) not be waiting on any other higher-index calls
                        if (successes[prospectiveIndex] &&
                            new Array(prospectiveIndex).fill(0).every((_, j) => successes[j] === false)) {
                            resolved = true;
                            resolve(providers[prospectiveIndex]);
                        }
                    });
                });
            });
        });
    });
}
exports.getBestProvider = getBestProvider;
