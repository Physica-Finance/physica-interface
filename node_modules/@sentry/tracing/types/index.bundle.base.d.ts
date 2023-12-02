export type { Breadcrumb, Request, SdkInfo, Event, Exception, Severity, SeverityLevel, StackFrame, Stacktrace, Thread, User, } from '@sentry/types';
export type { BrowserOptions, ReportDialogOptions } from '@sentry/browser';
export { addGlobalEventProcessor, addBreadcrumb, captureException, captureEvent, captureMessage, configureScope, getHubFromCarrier, getCurrentHub, Hub, Scope, setContext, setExtra, setExtras, setTag, setTags, setUser, startTransaction, makeFetchTransport, makeXHRTransport, withScope, } from '@sentry/browser';
export { BrowserClient } from '@sentry/browser';
export { defaultIntegrations, defaultStackParser, forceLoad, init, lastEventId, onLoad, showReportDialog, flush, close, wrap, } from '@sentry/browser';
export { SDK_VERSION } from '@sentry/browser';
import { addExtensionMethods, BrowserTracing } from '@sentry-internal/tracing';
import type { Integration } from '@sentry/types';
export { Span } from '@sentry/core';
declare const INTEGRATIONS: Record<string, new (...args: any[]) => Integration>;
export { INTEGRATIONS as Integrations };
export { BrowserTracing };
export { addExtensionMethods };
//# sourceMappingURL=index.bundle.base.d.ts.map