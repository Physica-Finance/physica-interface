/**
 * @param urls - An array of URLs to try to connect to.
 * @param timeout - How long to wait before a call is considered failed, in ms.
 */
export declare function getBestUrl(urls: string[], timeout: number): Promise<string>;
