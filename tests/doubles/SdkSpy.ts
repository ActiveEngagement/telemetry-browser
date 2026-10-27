import type { Sdk, SdkConfig } from '../../src/telemetry.js';

export class SdkSpy implements Sdk {
    readonly configs: SdkConfig[] = [];
    readonly attributes: Array<Record<string, string>> = [];

    init(config: SdkConfig): void {
        this.configs.push(config);
    }

    setGlobalAttributes(attributes: Record<string, string>): void {
        this.attributes.push(attributes);
    }
}

export class SdkLoaderSpy {
    loads = 0;

    constructor(readonly sdk: SdkSpy = new SdkSpy()) {}

    readonly load = async (): Promise<SdkSpy> => {
        this.loads += 1;

        return this.sdk;
    };
}
