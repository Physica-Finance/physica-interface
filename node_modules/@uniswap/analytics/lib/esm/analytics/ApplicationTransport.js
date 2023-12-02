import { BaseTransport } from '@amplitude/analytics-core';
export var OriginApplication;
(function (OriginApplication) {
    OriginApplication["DOCS"] = "docs";
    OriginApplication["INTERFACE"] = "interface";
    OriginApplication["ORG"] = "org";
})(OriginApplication || (OriginApplication = {}));
/**
 * A custom Transport layer that sets `x-origin-application` to route the application to its Amplitude project
 *
 * @param originApplication Name of the application consuming the package. Used to route events to its project.
 *
 * See example here: https://github.com/amplitude/Amplitude-TypeScript/blob/main/packages/analytics-client-common/src/transports/fetch.ts
 */
export class ApplicationTransport extends BaseTransport {
    originApplication;
    constructor(originApplication) {
        super();
        this.originApplication = originApplication;
        /* istanbul ignore if */
        if (typeof fetch === 'undefined') {
            throw new Error('FetchTransport is not supported');
        }
    }
    async send(serverUrl, payload) {
        const request = {
            headers: {
                'x-origin-application': this.originApplication,
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            keepalive: true,
            body: JSON.stringify(payload),
            method: 'POST',
        };
        const response = await fetch(serverUrl, request);
        const responseJSON = await response.json();
        return this.buildResponse(responseJSON);
    }
}
