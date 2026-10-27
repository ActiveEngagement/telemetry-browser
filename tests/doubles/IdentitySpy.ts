import type { TelemetryUser } from '../../src/config.js';
import type { Telemetry } from '../../src/telemetry.js';

export class IdentitySpy implements Pick<Telemetry, 'identify' | 'anonymize'> {
    readonly calls: Array<{ identify: TelemetryUser } | 'anonymize'> = [];

    identify(user: TelemetryUser): void {
        this.calls.push({ identify: user });
    }

    anonymize(): void {
        this.calls.push('anonymize');
    }
}
