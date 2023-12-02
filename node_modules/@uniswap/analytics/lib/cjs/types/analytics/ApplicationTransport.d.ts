import { BaseTransport } from '@amplitude/analytics-core';
import { Payload, Response, Transport } from '@amplitude/analytics-types';
export declare enum OriginApplication {
    DOCS = "docs",
    INTERFACE = "interface",
    ORG = "org"
}
/**
 * A custom Transport layer that sets `x-origin-application` to route the application to its Amplitude project
 *
 * @param originApplication Name of the application consuming the package. Used to route events to its project.
 *
 * See example here: https://github.com/amplitude/Amplitude-TypeScript/blob/main/packages/analytics-client-common/src/transports/fetch.ts
 */
export declare class ApplicationTransport extends BaseTransport implements Transport {
    private originApplication;
    constructor(originApplication: OriginApplication);
    send(serverUrl: string, payload: Payload): Promise<Response | null>;
}
//# sourceMappingURL=ApplicationTransport.d.ts.map