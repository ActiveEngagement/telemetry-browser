import type HyperDX from '@hyperdx/browser';

import { createTelemetry, type Telemetry } from './telemetry.js';

export { CONFIG_ELEMENT_ID, parseConfig, readConfig, SCHEMA_VERSION } from './config.js';
export type { DisabledTelemetryConfig, EnabledTelemetryConfig, ReplayConfig, TelemetryConfig, TelemetryUser } from './config.js';
export type { InitOptions, Sdk, SdkConfig, Telemetry } from './telemetry.js';

type HyperDXTelemetry = Telemetry<typeof HyperDX>;

// Lazy, so a page that never starts telemetry never downloads the SDK.
const telemetry: HyperDXTelemetry = createTelemetry(async () => (await import('@hyperdx/browser')).default);

export const init: HyperDXTelemetry['init'] = telemetry.init;
export const identify: HyperDXTelemetry['identify'] = telemetry.identify;
export const anonymize: HyperDXTelemetry['anonymize'] = telemetry.anonymize;

export default telemetry;
