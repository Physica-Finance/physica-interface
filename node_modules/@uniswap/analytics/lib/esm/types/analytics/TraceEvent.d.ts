import React, { PropsWithChildren } from 'react';
import { ITraceContext } from './Trace';
declare type TraceEventProps = {
    events: string[];
    name: string;
    properties?: Record<string, unknown>;
    shouldLogImpression?: boolean;
} & ITraceContext;
/**
 * Analytics instrumentation component that wraps event callbacks with logging logic.
 *
 * @example
 *  <TraceEvent events={[Event.onClick]} element={ElementName.SWAP_BUTTON}>
 *    <Button onClick={() => console.log('clicked')}>Click me</Button>
 *  </TraceEvent>
 */
export declare const TraceEvent: React.MemoExoticComponent<(props: PropsWithChildren<TraceEventProps>) => JSX.Element>;
export {};
//# sourceMappingURL=TraceEvent.d.ts.map