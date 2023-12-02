import { jsx as _jsx } from "react/jsx-runtime";
import { Children, cloneElement, isValidElement, memo } from 'react';
import { sendAnalyticsEvent } from '.';
import { Trace, TraceContext } from './Trace';
/**
 * Analytics instrumentation component that wraps event callbacks with logging logic.
 *
 * @example
 *  <TraceEvent events={[Event.onClick]} element={ElementName.SWAP_BUTTON}>
 *    <Button onClick={() => console.log('clicked')}>Click me</Button>
 *  </TraceEvent>
 */
export const TraceEvent = memo((props) => {
    const { shouldLogImpression, name, properties, events, children, ...traceProps } = props;
    return (_jsx(Trace, { ...traceProps, children: _jsx(TraceContext.Consumer, { children: (traceContext) => Children.map(children, (child) => {
                if (!isValidElement(child)) {
                    return child;
                }
                // For each child, augment event handlers defined in `events` with event tracing.
                return cloneElement(child, getEventHandlers(child, traceContext, events, name, properties, shouldLogImpression));
            }) }) }));
});
TraceEvent.displayName = 'TraceEvent';
/**
 * Given a set of child element and event props, returns a spreadable
 * object of the event handlers augmented with analytics logging.
 */
function getEventHandlers(child, traceContext, events, name, properties, shouldLogImpression = true) {
    const eventHandlers = {};
    for (const event of events) {
        eventHandlers[event] = (eventHandlerArgs) => {
            // call child event handler with original arguments, must be in array
            const args = Array.isArray(eventHandlerArgs) ? eventHandlerArgs : [eventHandlerArgs];
            child.props[event]?.apply(child, args);
            // augment handler with analytics logging
            if (shouldLogImpression) {
                sendAnalyticsEvent(name, { ...traceContext, ...properties, action: event });
            }
        };
    }
    // return a spreadable event handler object
    return eventHandlers;
}
