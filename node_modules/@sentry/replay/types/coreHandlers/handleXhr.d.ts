import type { HandlerDataXhr } from '@sentry/types';
import type { ReplayContainer, ReplayPerformanceEntry } from '../types';
/** only exported for tests */
export declare function handleXhr(handlerData: HandlerDataXhr): ReplayPerformanceEntry | null;
/**
 * Returns a listener to be added to `addInstrumentationHandler('xhr', listener)`.
 */
export declare function handleXhrSpanListener(replay: ReplayContainer): (handlerData: HandlerDataXhr) => void;
//# sourceMappingURL=handleXhr.d.ts.map