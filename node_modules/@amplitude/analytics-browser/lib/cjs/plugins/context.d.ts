import { BeforePlugin, BrowserConfig, Event, PluginType } from '@amplitude/analytics-types';
import UAParser from '@amplitude/ua-parser-js';
export declare class Context implements BeforePlugin {
    name: string;
    type: PluginType.BEFORE;
    config: BrowserConfig;
    eventId: number;
    uaResult: UAParser.IResult;
    library: string;
    constructor();
    setup(config: BrowserConfig): Promise<undefined>;
    execute(context: Event): Promise<Event>;
    isSessionValid(): boolean;
}
//# sourceMappingURL=context.d.ts.map