import type HyperDX from '@hyperdx/browser';

import { type EnabledTelemetryConfig, parseConfig, readConfig, type TelemetryConfig, type TelemetryUser, warn } from './config.js';
import { ANONYMOUS_ATTRIBUTES, userAttributes } from './identity.js';

export type Sdk = Pick<typeof HyperDX, 'init' | 'setGlobalAttributes'>;

export type SdkConfig = Parameters<Sdk['init']>[0];

/** Settings JSON cannot carry (regexes, callbacks, instrumentations). They override the tag. */
export type InitOptions = Partial<SdkConfig> & {
    config?: TelemetryConfig;
};

export type Telemetry<T extends Sdk = Sdk> = {
    init(options?: InitOptions): Promise<T | null>;
    identify(user: TelemetryUser): void;
    anonymize(): void;
};

export function toSdkConfig(config: EnabledTelemetryConfig, overrides: Partial<SdkConfig> = {}): SdkConfig {
    return {
        url: config.url,
        apiKey: config.apiKey,
        service: config.service,
        consoleCapture: config.consoleCapture,
        disableReplay: !config.replay.enabled,
        maskAllInputs: config.replay.maskAllInputs,
        ...(config.replay.blockSelector ? { blockSelector: config.replay.blockSelector } : {}),
        otelResourceAttributes: {
            'deployment.environment.name': config.environment,
            // The old name, for dashboards that still filter on it.
            'deployment.environment': config.environment,
            ...(config.version ? { 'service.version': config.version } : {}),
        },
        ...overrides,
    };
}

export function createTelemetry<T extends Sdk>(loadSdk: () => Promise<T>): Telemetry<T> {
    let started: Promise<T | null> | null = null;
    let sdk: T | null = null;

    // Undefined until the app identifies or anonymizes; until then the tag's user applies.
    let user: TelemetryUser | null | undefined;

    async function start({ config: explicitConfig, ...overrides }: InitOptions): Promise<T | null> {
        if (typeof window === 'undefined') {
            return null;
        }

        const config = explicitConfig ? parseConfig(explicitConfig) : readConfig();

        if (!config?.enabled) {
            return null;
        }

        let loaded: T;

        // A blocked or redeployed SDK chunk must not reject init(), which apps call with `void`.
        try {
            loaded = await loadSdk();
            loaded.init(toSdkConfig(config, overrides));
        } catch (error) {
            warn('The HyperDX SDK failed to load or start.', error);

            return null;
        }

        sdk = loaded;

        const initialUser = user === undefined ? config.user : user;

        if (initialUser) {
            loaded.setGlobalAttributes(userAttributes(initialUser));
        }

        return loaded;
    }

    return {
        init(options = {}) {
            started ??= start(options);

            return started;
        },

        identify(next) {
            user = next;
            sdk?.setGlobalAttributes(userAttributes(next));
        },

        anonymize() {
            user = null;
            sdk?.setGlobalAttributes(ANONYMOUS_ATTRIBUTES);
        },
    };
}
