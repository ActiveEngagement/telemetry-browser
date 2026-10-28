import fixture from '../fixtures/config.v1.json';
import type { DisabledTelemetryConfig, EnabledTelemetryConfig, TelemetryConfig } from '../src/config.js';

export const CONFIG = fixture as EnabledTelemetryConfig;

export const DISABLED_CONFIG: DisabledTelemetryConfig = { v: 1, enabled: false };

export function renderTag(content: string): void {
    document.head.innerHTML = `<script id="telemetry-config" type="application/json">${content}</script>`;
}

export function renderConfig(config: TelemetryConfig): void {
    renderTag(JSON.stringify(config));
}
