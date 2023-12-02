"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUserProperties = exports.getBrowser = exports.Browser = exports.BrowserEvent = exports.SharedEventName = void 0;
/**
 * General event names that can be reused across products.
 */
var SharedEventName;
(function (SharedEventName) {
    SharedEventName["APP_LOADED"] = "Application Loaded";
    SharedEventName["ELEMENT_CLICKED"] = "Element Clicked";
    SharedEventName["FOOTER_CLICKED"] = "Footer Clicked";
    SharedEventName["MENU_CLICKED"] = "Menu Clicked";
    SharedEventName["NAVBAR_CLICKED"] = "Navbar Clicked";
    SharedEventName["PAGE_CLICKED"] = "Page Clicked";
    SharedEventName["PAGE_VIEWED"] = "Page Viewed";
    SharedEventName["SEARCH_BAR_CLICKED"] = "Search Bar Clicked";
    SharedEventName["SENTIMENT_SUBMITTED"] = "Sentiment Submitted";
    SharedEventName["WEB_VITALS"] = "Web Vitals";
})(SharedEventName = exports.SharedEventName || (exports.SharedEventName = {}));
/**
 * Known events that trigger callbacks.
 * @example
 *  <TraceEvent events={[BrowserEvent.onClick]} element={name}>
 */
var BrowserEvent;
(function (BrowserEvent) {
    BrowserEvent["onClick"] = "onClick";
    BrowserEvent["onFocus"] = "onFocus";
    BrowserEvent["onKeyPress"] = "onKeyPress";
    BrowserEvent["onSelect"] = "onSelect";
})(BrowserEvent = exports.BrowserEvent || (exports.BrowserEvent = {}));
var Browser;
(function (Browser) {
    Browser["BRAVE"] = "Brave";
    Browser["CHROME"] = "Google Chrome or Chromium";
    Browser["EDGE"] = "Microsoft Edge (Legacy)";
    Browser["EDGE_CHROMIUM"] = "Microsoft Edge (Chromium)";
    Browser["FIREFOX"] = "Mozilla Firefox";
    Browser["INTERNET_EXPLORER"] = "Microsoft Internet Explorer";
    Browser["OPERA"] = "Opera";
    Browser["SAFARI"] = "Apple Safari";
    Browser["SAMSUNG"] = "Samsung Internet";
    Browser["UNKNOWN"] = "unknown";
})(Browser = exports.Browser || (exports.Browser = {}));
// Get browser being used, code comes from: https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator.
function getBrowser() {
    const sUsrAg = navigator.userAgent;
    // The order matters here, and this may report false positives for unlisted browsers.
    if (sUsrAg.indexOf('Firefox') > -1) {
        return Browser.FIREFOX;
        // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    }
    else if (sUsrAg.indexOf('SamsungBrowser') > -1) {
        return Browser.SAMSUNG;
        // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    }
    else if (sUsrAg.indexOf('Opera') > -1 || sUsrAg.indexOf('OPR') > -1) {
        return Browser.OPERA;
        // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    }
    else if (sUsrAg.indexOf('Trident') > -1) {
        return Browser.INTERNET_EXPLORER;
    }
    else if (sUsrAg.indexOf('Brave') > -1) {
        return Browser.BRAVE;
        // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    }
    else if (sUsrAg.indexOf('Edge') > -1) {
        return Browser.EDGE;
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    }
    else if (sUsrAg.indexOf('Edg') > -1) {
        return Browser.EDGE_CHROMIUM;
        // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.64
    }
    else if (sUsrAg.indexOf('Chrome') > -1) {
        return Browser.CHROME;
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    }
    else if (sUsrAg.indexOf('Safari') > -1) {
        return Browser.SAFARI;
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    }
    else {
        return Browser.UNKNOWN;
    }
}
exports.getBrowser = getBrowser;
var CustomUserProperties;
(function (CustomUserProperties) {
    CustomUserProperties["ALL_WALLET_ADDRESSES_CONNECTED"] = "all_wallet_addresses_connected";
    CustomUserProperties["ALL_WALLET_CHAIN_IDS"] = "all_wallet_chain_ids";
    CustomUserProperties["BROWSER"] = "browser";
    CustomUserProperties["DARK_MODE"] = "is_dark_mode";
    CustomUserProperties["EXPERT_MODE"] = "is_expert_mode";
    CustomUserProperties["PEER_WALLET_AGENT"] = "peer_wallet_agent";
    CustomUserProperties["SCREEN_RESOLUTION_HEIGHT"] = "screen_resolution_height";
    CustomUserProperties["SCREEN_RESOLUTION_WIDTH"] = "screen_resolution_width";
    CustomUserProperties["USER_AGENT"] = "user_agent";
    CustomUserProperties["WALLET_ADDRESS"] = "wallet_address";
    CustomUserProperties["WALLET_TYPE"] = "wallet_type";
})(CustomUserProperties = exports.CustomUserProperties || (exports.CustomUserProperties = {}));
