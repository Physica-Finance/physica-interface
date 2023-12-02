"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY = exports.Empty = void 0;
const types_1 = require("@web3-react/types");
class Empty extends types_1.Connector {
    /**
     * No-op. May be called if it simplifies application code.
     */
    activate() {
        void 0;
    }
}
exports.Empty = Empty;
// @ts-expect-error actions aren't validated and are only used to set a protected property, so this is ok
exports.EMPTY = new Empty();
