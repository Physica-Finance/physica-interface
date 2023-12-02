"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceEvent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const _1 = require(".");
const Trace_1 = require("./Trace");
/**
 * Analytics instrumentation component that wraps event callbacks with logging logic.
 *
 * @example
 *  <TraceEvent events={[Event.onClick]} element={ElementName.SWAP_BUTTON}>
 *    <Button onClick={() => console.log('clicked')}>Click me</Button>
 *  </TraceEvent>
 */
exports.TraceEvent = (0, react_1.memo)((props) => {
    const { shouldLogImpression, name, properties, events, children } = props, traceProps = __rest(props, ["shouldLogImpression", "name", "properties", "events", "children"]);
    return ((0, jsx_runtime_1.jsx)(Trace_1.Trace, Object.assign({}, traceProps, { children: (0, jsx_runtime_1.jsx)(Trace_1.TraceContext.Consumer, { children: (traceContext) => react_1.Children.map(children, (child) => {
                if (!(0, react_1.isValidElement)(child)) {
                    return child;
                }
                // For each child, augment event handlers defined in `events` with event tracing.
                return (0, react_1.cloneElement)(child, getEventHandlers(child, traceContext, events, name, properties, shouldLogImpression));
            }) }) })));
});
exports.TraceEvent.displayName = 'TraceEvent';
/**
 * Given a set of child element and event props, returns a spreadable
 * object of the event handlers augmented with analytics logging.
 */
function getEventHandlers(child, traceContext, events, name, properties, shouldLogImpression = true) {
    const eventHandlers = {};
    for (const event of events) {
        eventHandlers[event] = (eventHandlerArgs) => {
            var _a;
            // call child event handler with original arguments, must be in array
            const args = Array.isArray(eventHandlerArgs) ? eventHandlerArgs : [eventHandlerArgs];
            (_a = child.props[event]) === null || _a === void 0 ? void 0 : _a.apply(child, args);
            // augment handler with analytics logging
            if (shouldLogImpression) {
                (0, _1.sendAnalyticsEvent)(name, Object.assign(Object.assign(Object.assign({}, traceContext), properties), { action: event }));
            }
        };
    }
    // return a spreadable event handler object
    return eventHandlers;
}
