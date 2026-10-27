/** The major version of the config shape. New optional fields do not change it. */
export const SCHEMA_VERSION = 1;

export const CONFIG_ELEMENT_ID = 'telemetry-config';

export type TelemetryUser = {
    id: string | number;
    name?: string | null;
    email?: string | null;
};

export type ReplayConfig = {
    enabled: boolean;
    maskAllInputs: boolean;
    blockSelector?: string | null;
};

/** The JSON that laravel-telemetry's `@telemetry` directive renders. */
export type TelemetryConfig = {
    v: number;
    enabled: boolean;
    url: string;
    apiKey: string;
    service: string;
    environment: string;
    version?: string | null;
    user?: TelemetryUser | null;
    replay: ReplayConfig;
    consoleCapture: boolean;
};

export function readConfig(doc: Document = document): TelemetryConfig | null {
    const json = doc.getElementById(CONFIG_ELEMENT_ID)?.textContent;

    if (!json) {
        warn(`No #${CONFIG_ELEMENT_ID} tag. Render @telemetry in the layout, or pass a config to init().`);

        return null;
    }

    try {
        return parseConfig(JSON.parse(json) as TelemetryConfig);
    } catch (error) {
        warn(`The #${CONFIG_ELEMENT_ID} tag is not valid JSON.`, error);

        return null;
    }
}

export function parseConfig(config: TelemetryConfig): TelemetryConfig | null {
    if (config.v !== SCHEMA_VERSION) {
        warn(`Config version ${String(config.v)} is not supported; this package reads version ${SCHEMA_VERSION}. Update @actengage/telemetry-browser.`);

        return null;
    }

    return config;
}

function warn(message: string, ...details: unknown[]): void {
    console.warn(`[telemetry] ${message} Telemetry is off.`, ...details);
}
