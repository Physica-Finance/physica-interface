"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = exports.getSessionId = exports.getUserId = exports.getDeviceId = exports.sendAnalyticsEvent = exports.initializeAnalytics = exports.analyticsConfig = void 0;
const analytics_browser_1 = require("@amplitude/analytics-browser");
const ApplicationTransport_1 = require("./ApplicationTransport");
let isInitialized = false;
/**
 * Initializes Amplitude with API key for project.
 *
 * Uniswap has two Amplitude projects: test and production. You must be a
 * member of the organization on Amplitude to view details.
 *
 * @param apiKey API key of the application. Currently not utilized in order to keep keys private.
 * @param originApplication Name of the application consuming the package. Used to route events to the correct project.
 * @param options Contains options to be used in the configuration of the package
 */
function initializeAnalytics(apiKey, originApplication, config) {
    // Non-production environments may use hot-reloading, which will re-initialize but should be ignored.
    if (!(config === null || config === void 0 ? void 0 : config.isProductionEnv) && isInitialized) {
        return;
    }
    if (config === null || config === void 0 ? void 0 : config.isProductionEnv) {
        if (isInitialized) {
            throw new Error('initializeAnalytics called multiple times. Ensure it is outside of a React component.');
        }
        if (config.debug) {
            throw new Error(`It looks like you're trying to initialize analytics in debug mode for production. Disable debug mode or use a non-production environment.`);
        }
    }
    isInitialized = true;
    exports.analyticsConfig = config;
    (0, analytics_browser_1.init)(apiKey, 
    /* userId= */ undefined, // User ID should be undefined to let Amplitude default to Device ID
    /* options= */
    {
        // Configure the SDK to work with alternate endpoint
        serverUrl: config === null || config === void 0 ? void 0 : config.proxyUrl,
        // Configure the SDK to set the x-application-origin header
        transportProvider: new ApplicationTransport_1.ApplicationTransport(originApplication),
        // Disable tracking of private user information by Amplitude
        trackingOptions: {
            ipAddress: false,
            carrier: false,
            city: false,
            region: false,
            dma: false, // designated market area
        },
    });
}
exports.initializeAnalytics = initializeAnalytics;
/** Sends an event to Amplitude. */
function sendAnalyticsEvent(eventName, eventProperties) {
    const origin = window.location.origin;
    if (exports.analyticsConfig === null || exports.analyticsConfig === void 0 ? void 0 : exports.analyticsConfig.debug) {
        console.log({
            eventName,
            eventProperties: Object.assign(Object.assign({}, eventProperties), { origin }),
        });
    }
    (0, analytics_browser_1.track)(eventName, Object.assign(Object.assign({}, eventProperties), { origin }));
}
exports.sendAnalyticsEvent = sendAnalyticsEvent;
function getDeviceId() {
    return (0, analytics_browser_1.getDeviceId)();
}
exports.getDeviceId = getDeviceId;
function getUserId() {
    return (0, analytics_browser_1.getUserId)();
}
exports.getUserId = getUserId;
function getSessionId() {
    return (0, analytics_browser_1.getSessionId)();
}
exports.getSessionId = getSessionId;
/**
 * Class that exposes methods to mutate the User Model's properties in
 * Amplitude that represents the current session's user.
 *
 * See https://help.amplitude.com/hc/en-us/articles/115002380567-User-properties-and-event-properties
 * for details.
 */
class UserModel {
    log(method, ...parameters) {
        console.debug(`[amplitude(Identify)]: ${method}(${parameters})`);
    }
    call(mutate) {
        if (!(exports.analyticsConfig === null || exports.analyticsConfig === void 0 ? void 0 : exports.analyticsConfig.isProductionEnv)) {
            const log = (_, method) => this.log.bind(this, method);
            mutate(new Proxy(new analytics_browser_1.Identify(), { get: log }));
            return;
        }
        (0, analytics_browser_1.identify)(mutate(new analytics_browser_1.Identify()));
    }
    set(key, value) {
        this.call((event) => event.set(key, value));
    }
    setOnce(key, value) {
        this.call((event) => event.setOnce(key, value));
    }
    add(key, value) {
        this.call((event) => event.add(key, value));
    }
    postInsert(key, value) {
        this.call((event) => event.postInsert(key, value));
    }
    remove(key, value) {
        this.call((event) => event.remove(key, value));
    }
}
exports.user = new UserModel();
