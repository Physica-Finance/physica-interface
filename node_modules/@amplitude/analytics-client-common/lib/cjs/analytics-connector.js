Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsConnector = void 0;
var analytics_connector_1 = require("@amplitude/analytics-connector");
var getAnalyticsConnector = function () {
    return analytics_connector_1.AnalyticsConnector.getInstance('$default_instance');
};
exports.getAnalyticsConnector = getAnalyticsConnector;
//# sourceMappingURL=analytics-connector.js.map