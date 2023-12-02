import React, { PropsWithChildren } from 'react';
export interface ITraceContext {
    page?: string;
    section?: string;
    modal?: string;
    element?: string;
}
export declare const TraceContext: React.Context<ITraceContext>;
export declare function useTrace(trace?: ITraceContext): ITraceContext;
declare type TraceProps = {
    shouldLogImpression?: boolean;
    name?: string;
    properties?: Record<string, unknown>;
} & ITraceContext;
/**
 * Sends an analytics event on mount (if shouldLogImpression is set),
 * and propagates the context to child traces.
 *
 * It defaults to logging an EventName.PAGE_VIEWED if no `name` is provided.
 */
export declare const Trace: React.MemoExoticComponent<({ shouldLogImpression, name, children, page, section, modal, element, properties, }: PropsWithChildren<TraceProps>) => JSX.Element>;
export {};
//# sourceMappingURL=Trace.d.ts.map