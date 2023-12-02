"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OriginApplication = exports.user = exports.getUserId = exports.getSessionId = exports.getDeviceId = exports.sendAnalyticsEvent = exports.initializeAnalytics = void 0;
__exportStar(require("./analytics/Trace.js"), exports);
__exportStar(require("./analytics/TraceEvent.js"), exports);
var index_js_1 = require("./analytics/index.js");
Object.defineProperty(exports, "initializeAnalytics", { enumerable: true, get: function () { return index_js_1.initializeAnalytics; } });
Object.defineProperty(exports, "sendAnalyticsEvent", { enumerable: true, get: function () { return index_js_1.sendAnalyticsEvent; } });
Object.defineProperty(exports, "getDeviceId", { enumerable: true, get: function () { return index_js_1.getDeviceId; } });
Object.defineProperty(exports, "getSessionId", { enumerable: true, get: function () { return index_js_1.getSessionId; } });
Object.defineProperty(exports, "getUserId", { enumerable: true, get: function () { return index_js_1.getUserId; } });
Object.defineProperty(exports, "user", { enumerable: true, get: function () { return index_js_1.user; } });
var ApplicationTransport_js_1 = require("./analytics/ApplicationTransport.js");
Object.defineProperty(exports, "OriginApplication", { enumerable: true, get: function () { return ApplicationTransport_js_1.OriginApplication; } });
