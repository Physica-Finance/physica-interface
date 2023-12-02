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
exports.ApplicationTransport = exports.OriginApplication = void 0;
const analytics_core_1 = require("@amplitude/analytics-core");
var OriginApplication;
(function (OriginApplication) {
    OriginApplication["DOCS"] = "docs";
    OriginApplication["INTERFACE"] = "interface";
    OriginApplication["ORG"] = "org";
})(OriginApplication = exports.OriginApplication || (exports.OriginApplication = {}));
/**
 * A custom Transport layer that sets `x-origin-application` to route the application to its Amplitude project
 *
 * @param originApplication Name of the application consuming the package. Used to route events to its project.
 *
 * See example here: https://github.com/amplitude/Amplitude-TypeScript/blob/main/packages/analytics-client-common/src/transports/fetch.ts
 */
class ApplicationTransport extends analytics_core_1.BaseTransport {
    constructor(originApplication) {
        super();
        this.originApplication = originApplication;
        /* istanbul ignore if */
        if (typeof fetch === 'undefined') {
            throw new Error('FetchTransport is not supported');
        }
    }
    send(serverUrl, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                headers: {
                    'x-origin-application': this.originApplication,
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                },
                keepalive: true,
                body: JSON.stringify(payload),
                method: 'POST',
            };
            const response = yield fetch(serverUrl, request);
            const responseJSON = yield response.json();
            return this.buildResponse(responseJSON);
        });
    }
}
exports.ApplicationTransport = ApplicationTransport;
