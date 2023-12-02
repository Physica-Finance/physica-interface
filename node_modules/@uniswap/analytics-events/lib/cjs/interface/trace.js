"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceElementName = exports.InterfaceModalName = exports.InterfaceSectionName = exports.InterfacePageName = void 0;
/**
 * Known pages in the app. Highest order context.
 */
var InterfacePageName;
(function (InterfacePageName) {
    InterfacePageName["ABOUT_PAGE"] = "about-page";
    InterfacePageName["LANDING_PAGE"] = "landing-page";
    InterfacePageName["NFT_COLLECTION_PAGE"] = "nft-collection-page";
    InterfacePageName["NFT_DETAILS_PAGE"] = "nft-details-page";
    InterfacePageName["NFT_EXPLORE_PAGE"] = "nft-explore-page";
    InterfacePageName["NFT_PROFILE_PAGE"] = "nft-profile-page";
    InterfacePageName["NOT_FOUND"] = "not-found";
    InterfacePageName["POOL_PAGE"] = "pool-page";
    InterfacePageName["SWAP_PAGE"] = "swap-page";
    InterfacePageName["TOKENS_PAGE"] = "tokens-page";
    InterfacePageName["TOKEN_DETAILS_PAGE"] = "token-details";
    InterfacePageName["VOTE_PAGE"] = "vote-page";
})(InterfacePageName = exports.InterfacePageName || (exports.InterfacePageName = {}));
/**
 * Sections. Disambiguates low-level elements that may share a name.
 * eg a `back` button in a modal will have the same `element`,
 * but a different `section`.
 */
var InterfaceSectionName;
(function (InterfaceSectionName) {
    InterfaceSectionName["CURRENCY_INPUT_PANEL"] = "swap-currency-input";
    InterfaceSectionName["CURRENCY_OUTPUT_PANEL"] = "swap-currency-output";
    InterfaceSectionName["MINI_PORTFOLIO"] = "mini-portfolio";
    InterfaceSectionName["NAVBAR_SEARCH"] = "Navbar Search";
    InterfaceSectionName["WIDGET"] = "widget";
})(InterfaceSectionName = exports.InterfaceSectionName || (exports.InterfaceSectionName = {}));
/** Known modals for analytics purposes. */
var InterfaceModalName;
(function (InterfaceModalName) {
    InterfaceModalName["CONFIRM_SWAP"] = "confirm-swap-modal";
    InterfaceModalName["NFT_LISTING"] = "nft-listing-modal";
    InterfaceModalName["NFT_TX_COMPLETE"] = "nft-tx-complete-modal";
    InterfaceModalName["TOKEN_SELECTOR"] = "token-selector-modal";
})(InterfaceModalName = exports.InterfaceModalName || (exports.InterfaceModalName = {}));
/**
 * Known element names for analytics purposes.
 * Use to identify low-level components given a TraceContext
 */
var InterfaceElementName;
(function (InterfaceElementName) {
    InterfaceElementName["ABOUT_PAGE_ANALYTICS_CARD"] = "about-page-analytics-card";
    InterfaceElementName["ABOUT_PAGE_BUY_CRYPTO_CARD"] = "about-page-buy-crypto-card";
    InterfaceElementName["ABOUT_PAGE_DEV_DOCS_CARD"] = "about-page-dev-docs-card";
    InterfaceElementName["ABOUT_PAGE_EARN_CARD"] = "about-page-earn-card";
    InterfaceElementName["ABOUT_PAGE_NFTS_CARD"] = "about-page-nfts-card";
    InterfaceElementName["ABOUT_PAGE_SWAP_CARD"] = "about-page-swap-card";
    InterfaceElementName["ABOUT_PAGE_SWAP_ELEMENT"] = "about-page-swap-element";
    InterfaceElementName["AUTOROUTER_VISUALIZATION_ROW"] = "expandable-autorouter-visualization-row";
    InterfaceElementName["BLOG_LINK"] = "blog-link";
    InterfaceElementName["CAREERS_LINK"] = "careers-link";
    InterfaceElementName["COMMON_BASES_CURRENCY_BUTTON"] = "common-bases-currency-button";
    InterfaceElementName["CONFIRM_SWAP_BUTTON"] = "confirm-swap-or-send";
    InterfaceElementName["CONNECT_WALLET_BUTTON"] = "connect-wallet-button";
    InterfaceElementName["CONTINUE_BUTTON"] = "continue-button";
    InterfaceElementName["DISCONNECT_WALLET_BUTTON"] = "disconnect-wallet-button";
    InterfaceElementName["DOCS_LINK"] = "docs-link";
    InterfaceElementName["EXPLORE_BANNER"] = "explore-banner";
    InterfaceElementName["EXPLORE_SEARCH_INPUT"] = "explore_search_input";
    InterfaceElementName["FIAT_ON_RAMP_BUY_BUTTON"] = "fiat-on-ramp-buy-button";
    InterfaceElementName["FIAT_ON_RAMP_LEARN_MORE_LINK"] = "fiat-on-ramp-learn-more-link";
    InterfaceElementName["IMPORT_TOKEN_BUTTON"] = "import-token-button";
    InterfaceElementName["LANDING_PAGE_SWAP_ELEMENT"] = "landing-page-swap-element";
    InterfaceElementName["LEARN_MORE_LINK"] = "learn-more-link";
    InterfaceElementName["LEGACY_LANDING_PAGE_LINK"] = "legacy-landing-page-link";
    InterfaceElementName["MAX_TOKEN_AMOUNT_BUTTON"] = "max-token-amount-button";
    InterfaceElementName["MINI_PORTFOLIO_ACTIVITY_ROW"] = "mini-portfolio-activity-row";
    InterfaceElementName["MINI_PORTFOLIO_ACTIVITY_TAB"] = "mini-portfolio-activity-tab";
    InterfaceElementName["MINI_PORTFOLIO_NFT_ITEM"] = "mini-portfolio-nft-item";
    InterfaceElementName["MINI_PORTFOLIO_NFT_TAB"] = "mini-portfolio-nft-tab";
    InterfaceElementName["MINI_PORTFOLIO_POOLS_ROW"] = "mini-portfolio-pools-row";
    InterfaceElementName["MINI_PORTFOLIO_POOLS_TAB"] = "mini-portfolio-pools-tab";
    InterfaceElementName["MINI_PORTFOLIO_TOKENS_TAB"] = "mini-portfolio-tokens-tab";
    InterfaceElementName["MINI_PORTFOLIO_TOKEN_ROW"] = "mini-portfolio-token-row";
    InterfaceElementName["NAVBAR_SEARCH_INPUT"] = "navbar-search-input";
    InterfaceElementName["NFT_ACTIVITY_TAB"] = "nft-activity-tab";
    InterfaceElementName["NFT_BUY_BAG_PAY_BUTTON"] = "nft-buy-bag-pay-button";
    InterfaceElementName["NFT_FILTER_BUTTON"] = "nft-filter-button";
    InterfaceElementName["NFT_FILTER_OPTION"] = "nft-filter-option";
    InterfaceElementName["NFT_TRENDING_ROW"] = "nft-trending-row";
    InterfaceElementName["PRICE_UPDATE_ACCEPT_BUTTON"] = "price-update-accept-button";
    InterfaceElementName["SUPPORT_LINK"] = "support-link";
    InterfaceElementName["SWAP_BUTTON"] = "swap-button";
    InterfaceElementName["SWAP_DETAILS_DROPDOWN"] = "swap-details-dropdown";
    InterfaceElementName["SWAP_TOKENS_REVERSE_ARROW_BUTTON"] = "swap-tokens-reverse-arrow-button";
    InterfaceElementName["TAX_SERVICE_BANNER_CTA_BUTTON"] = "tax-service-banner-learn-more-button";
    InterfaceElementName["TAX_SERVICE_COINTRACKER_BUTTON"] = "tax-service-cointracker-link-button";
    InterfaceElementName["TAX_SERVICE_TOKENTAX_BUTTON"] = "tax-service-tokentax-link-button";
    InterfaceElementName["TOKEN_SELECTOR_ROW"] = "token-selector-row";
    InterfaceElementName["TWITTER_LINK"] = "twitter-link";
    InterfaceElementName["UNISWAP_WALLET_BANNER_DOWNLOAD_BUTTON"] = "uniswap-wallet-banner-download-button";
    InterfaceElementName["UNISWAP_WALLET_CONNECTOR"] = "uniswap-wallet-connector";
    InterfaceElementName["UNISWAP_WALLET_MODAL_DOWNLOAD_BUTTON"] = "uniswap-wallet-modal-download-button";
    InterfaceElementName["WALLET_TYPE_OPTION"] = "wallet-type-option";
})(InterfaceElementName = exports.InterfaceElementName || (exports.InterfaceElementName = {}));
