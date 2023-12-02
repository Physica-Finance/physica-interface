import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, memo, useContext, useEffect, useMemo } from 'react';
import { sendAnalyticsEvent, analyticsConfig } from '.';
const DEFAULT_EVENT = 'Page Viewed';
export const TraceContext = createContext({});
export function useTrace(trace) {
    const parentTrace = useContext(TraceContext);
    return useMemo(() => ({ ...parentTrace, ...trace }), [parentTrace, trace]);
}
/**
 * Sends an analytics event on mount (if shouldLogImpression is set),
 * and propagates the context to child traces.
 *
 * It defaults to logging an EventName.PAGE_VIEWED if no `name` is provided.
 */
export const Trace = memo(({ shouldLogImpression, name, children, page, section, modal, element, properties, }) => {
    const parentTrace = useTrace();
    const combinedProps = useMemo(() => ({
        ...parentTrace,
        ...Object.fromEntries(Object.entries({ page, section, modal, element }).filter(([_, v]) => v !== undefined)),
    }), [element, parentTrace, page, modal, section]);
    useEffect(() => {
        if (shouldLogImpression) {
            // If an event name is not provided, fallback to the config defaultEventName, otherwise local default
            sendAnalyticsEvent(name ?? analyticsConfig?.defaultEventName ?? DEFAULT_EVENT, {
                ...combinedProps,
                ...properties,
                git_commit_hash: analyticsConfig?.commitHash,
            });
        }
        // Impressions should only be logged on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return _jsx(TraceContext.Provider, { value: combinedProps, children: children });
});
Trace.displayName = 'Trace';
