/**
 * General event names that can be reused across products.
 */
export declare enum SharedEventName {
    APP_LOADED = "Application Loaded",
    ELEMENT_CLICKED = "Element Clicked",
    FOOTER_CLICKED = "Footer Clicked",
    MENU_CLICKED = "Menu Clicked",
    NAVBAR_CLICKED = "Navbar Clicked",
    PAGE_CLICKED = "Page Clicked",
    PAGE_VIEWED = "Page Viewed",
    SEARCH_BAR_CLICKED = "Search Bar Clicked",
    SENTIMENT_SUBMITTED = "Sentiment Submitted",
    WEB_VITALS = "Web Vitals"
}
/**
 * Known events that trigger callbacks.
 * @example
 *  <TraceEvent events={[BrowserEvent.onClick]} element={name}>
 */
export declare enum BrowserEvent {
    onClick = "onClick",
    onFocus = "onFocus",
    onKeyPress = "onKeyPress",
    onSelect = "onSelect"
}
export declare enum Browser {
    BRAVE = "Brave",
    CHROME = "Google Chrome or Chromium",
    EDGE = "Microsoft Edge (Legacy)",
    EDGE_CHROMIUM = "Microsoft Edge (Chromium)",
    FIREFOX = "Mozilla Firefox",
    INTERNET_EXPLORER = "Microsoft Internet Explorer",
    OPERA = "Opera",
    SAFARI = "Apple Safari",
    SAMSUNG = "Samsung Internet",
    UNKNOWN = "unknown"
}
export declare function getBrowser(): string;
export declare enum CustomUserProperties {
    ALL_WALLET_ADDRESSES_CONNECTED = "all_wallet_addresses_connected",
    ALL_WALLET_CHAIN_IDS = "all_wallet_chain_ids",
    BROWSER = "browser",
    DARK_MODE = "is_dark_mode",
    EXPERT_MODE = "is_expert_mode",
    PEER_WALLET_AGENT = "peer_wallet_agent",
    SCREEN_RESOLUTION_HEIGHT = "screen_resolution_height",
    SCREEN_RESOLUTION_WIDTH = "screen_resolution_width",
    USER_AGENT = "user_agent",
    WALLET_ADDRESS = "wallet_address",
    WALLET_TYPE = "wallet_type"
}
//# sourceMappingURL=primitives.d.ts.map