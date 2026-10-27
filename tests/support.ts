import fixture from '../fixtures/config.v1.json';
import type { TelemetryConfig } from '../src/config.js';

export const CONFIG: TelemetryConfig = fixture;

export function renderTag(content: string): void {
    document.head.innerHTML = `<script id="telemetry-config" type="application/json">${content}</script>`;
}

export function renderConfig(config: TelemetryConfig): void {
    renderTag(JSON.stringify(config));
}
