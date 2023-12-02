"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trace = exports.useTrace = exports.TraceContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const _1 = require(".");
const DEFAULT_EVENT = 'Page Viewed';
exports.TraceContext = (0, react_1.createContext)({});
function useTrace(trace) {
    const parentTrace = (0, react_1.useContext)(exports.TraceContext);
    return (0, react_1.useMemo)(() => (Object.assign(Object.assign({}, parentTrace), trace)), [parentTrace, trace]);
}
exports.useTrace = useTrace;
/**
 * Sends an analytics event on mount (if shouldLogImpression is set),
 * and propagates the context to child traces.
 *
 * It defaults to logging an EventName.PAGE_VIEWED if no `name` is provided.
 */
exports.Trace = (0, react_1.memo)(({ shouldLogImpression, name, children, page, section, modal, element, properties, }) => {
    const parentTrace = useTrace();
    const combinedProps = (0, react_1.useMemo)(() => (Object.assign(Object.assign({}, parentTrace), Object.fromEntries(Object.entries({ page, section, modal, element }).filter(([_, v]) => v !== undefined)))), [element, parentTrace, page, modal, section]);
    (0, react_1.useEffect)(() => {
        var _a;
        if (shouldLogImpression) {
            // If an event name is not provided, fallback to the config defaultEventName, otherwise local default
            (0, _1.sendAnalyticsEvent)((_a = name !== null && name !== void 0 ? name : _1.analyticsConfig === null || _1.analyticsConfig === void 0 ? void 0 : _1.analyticsConfig.defaultEventName) !== null && _a !== void 0 ? _a : DEFAULT_EVENT, Object.assign(Object.assign(Object.assign({}, combinedProps), properties), { git_commit_hash: _1.analyticsConfig === null || _1.analyticsConfig === void 0 ? void 0 : _1.analyticsConfig.commitHash }));
        }
        // Impressions should only be logged on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (0, jsx_runtime_1.jsx)(exports.TraceContext.Provider, Object.assign({ value: combinedProps }, { children: children }));
});
exports.Trace.displayName = 'Trace';
