import { AmplitudeCore } from '@amplitude/analytics-core';
import { AttributionOptions, BrowserClient, BrowserConfig, BrowserOptions, EventOptions, Identify as IIdentify, Result, Revenue as IRevenue, TransportType } from '@amplitude/analytics-types';
export declare class AmplitudeBrowser extends AmplitudeCore<BrowserConfig> {
    init(apiKey?: string, userId?: string, options?: BrowserOptions): Promise<void>;
    runAttributionStrategy(attributionConfig?: AttributionOptions, isNewSession?: boolean): Promise<void>;
    getUserId(): string | undefined;
    setUserId(userId: string | undefined): void;
    getDeviceId(): string | undefined;
    setDeviceId(deviceId: string): void;
    reset(): void;
    getSessionId(): number | undefined;
    setSessionId(sessionId: number): void;
    setTransport(transport: TransportType): void;
    identify(identify: IIdentify, eventOptions?: EventOptions): Promise<Result>;
    groupIdentify(groupType: string, groupName: string | string[], identify: IIdentify, eventOptions?: EventOptions): Promise<Result>;
    revenue(revenue: IRevenue, eventOptions?: EventOptions): Promise<Result>;
}
export declare const createInstance: () => BrowserClient;
declare const _default: BrowserClient;
export default _default;
//# sourceMappingURL=browser-client.d.ts.map