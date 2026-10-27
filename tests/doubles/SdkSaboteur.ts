import type { Sdk } from '../../src/telemetry.js';

export class SdkSaboteur implements Sdk {
    constructor(private readonly error: Error = new Error('The SDK failed to start.')) {}

    init(): void {
        throw this.error;
    }

    setGlobalAttributes(): void {}
}

export class SdkLoaderSaboteur {
    constructor(private readonly error: Error = new TypeError('Failed to fetch dynamically imported module')) {}

    readonly load = async (): Promise<Sdk> => {
        throw this.error;
    };
}
