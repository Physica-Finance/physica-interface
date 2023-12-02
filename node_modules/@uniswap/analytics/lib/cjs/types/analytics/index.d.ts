import { OriginApplication } from './ApplicationTransport';
declare type AnalyticsConfig = {
    proxyUrl?: string;
    commitHash?: string;
    defaultEventName?: string;
    isProductionEnv?: boolean;
    debug?: boolean;
};
export declare let analyticsConfig: AnalyticsConfig | undefined;
/**
 * Initializes Amplitude with API key for project.
 *
 * Uniswap has two Amplitude projects: test and production. You must be a
 * member of the organization on Amplitude to view details.
 *
 * @param apiKey API key of the application. Currently not utilized in order to keep keys private.
 * @param originApplication Name of the application consuming the package. Used to route events to the correct project.
 * @param options Contains options to be used in the configuration of the package
 */
export declare function initializeAnalytics(apiKey: string, originApplication: OriginApplication, config?: AnalyticsConfig): void;
/** Sends an event to Amplitude. */
export declare function sendAnalyticsEvent(eventName: string, eventProperties?: Record<string, unknown>): void;
export declare function getDeviceId(): string | undefined;
export declare function getUserId(): string | undefined;
export declare function getSessionId(): number | undefined;
declare type UserValue = string | number | boolean | string[] | number[];
/**
 * Class that exposes methods to mutate the User Model's properties in
 * Amplitude that represents the current session's user.
 *
 * See https://help.amplitude.com/hc/en-us/articles/115002380567-User-properties-and-event-properties
 * for details.
 */
declare class UserModel {
    private log;
    private call;
    set(key: string, value: UserValue): void;
    setOnce(key: string, value: UserValue): void;
    add(key: string, value: number): void;
    postInsert(key: string, value: string | number): void;
    remove(key: string, value: string | number): void;
}
export declare const user: UserModel;
export {};
//# sourceMappingURL=index.d.ts.map