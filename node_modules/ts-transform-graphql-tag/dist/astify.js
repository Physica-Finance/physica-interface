"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
// literal (and interpolations) to ast
function astify(literal, interpolations = []) {
    if (literal === null) {
        return ts.createNull();
    }
    switch (typeof literal) {
        case "function":
            throw new Error("`function` is the wrong type in JSON.");
        case "string":
        case "number":
        case "boolean":
            return ts.createLiteral(literal);
        case "undefined":
            return ts.createIdentifier("undefined");
        default:
            if (Array.isArray(literal)) {
                return ts.createArrayLiteral(literal.map(item => astify(item)));
            }
            return ts.createObjectLiteral(Object.keys(literal).map(k => {
                if (k === "definitions" && interpolations.length > 0) {
                    // insert interpolations
                    return ts.createPropertyAssignment(ts.createLiteral(k), ts.createCall(ts.createPropertyAccess(astify(literal[k]), "concat"), 
                    /* typeArguments */ undefined, interpolations.map(item => {
                        // add `definitions` property
                        return ts.createPropertyAccess(item, "definitions");
                    })));
                }
                return ts.createPropertyAssignment(ts.createLiteral(k), astify(literal[k]));
            }));
    }
}
exports.default = astify;
