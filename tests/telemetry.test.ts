import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTelemetry } from '../src/telemetry.js';
import { SdkLoaderSpy } from './doubles/SdkSpy.js';
import { CONFIG, renderConfig } from './support.js';

const ADA = {
    'user.id': '7',
    'user.name': 'Ada Lovelace',
    'user.email': 'ada@example.com',
    userId: '7',
    userName: 'Ada Lovelace',
    userEmail: 'ada@example.com',
};

let loader: SdkLoaderSpy;

beforeEach((): void => {
    document.head.innerHTML = '';
    loader = new SdkLoaderSpy();
});

describe('init', () => {
    it('starts the SDK with the settings from the tag', async (): Promise<void> => {
        renderConfig(CONFIG);

        await createTelemetry(loader.load).init();

        expect(loader.sdk.configs).toEqual([{
            url: 'https://telemetry.example.com',
            apiKey: '00000000-0000-4000-8000-000000000000',
            service: 'savant-browser',
            consoleCapture: true,
            disableReplay: false,
            maskAllInputs: true,
            blockSelector: 'iframe, [data-replay-block]',
            otelResourceAttributes: {
                'deployment.environment.name': 'production',
                'deployment.environment': 'production',
                'service.version': '4f15fac2d1e0b3a9c8e7f6a5b4c3d2e1f0a9b8c7',
            },
        }]);
    });

    it('identifies the user when the tag has one', async (): Promise<void> => {
        renderConfig(CONFIG);

        await createTelemetry(loader.load).init();

        expect(loader.sdk.attributes).toEqual([ADA]);
    });

    it('leaves out the block selector and the version when the tag has neither', async (): Promise<void> => {
        renderConfig({ ...CONFIG, version: null, replay: { ...CONFIG.replay, blockSelector: null } });

        await createTelemetry(loader.load).init();

        expect(loader.sdk.configs[0]).not.toHaveProperty('blockSelector');
        expect(loader.sdk.configs[0]?.otelResourceAttributes).not.toHaveProperty(['service.version']);
    });

    it('prefers an explicit config over the tag', async (): Promise<void> => {
        renderConfig(CONFIG);

        await createTelemetry(loader.load).init({ config: { ...CONFIG, service: 'courier-browser' } });

        expect(loader.sdk.configs[0]?.service).toBe('courier-browser');
    });

    it('lets the call override the tag', async (): Promise<void> => {
        renderConfig(CONFIG);
        const targets = [/api\.example\.com/];

        await createTelemetry(loader.load).init({ tracePropagationTargets: targets, maskAllInputs: false });

        expect(loader.sdk.configs[0]).toMatchObject({ tracePropagationTargets: targets, maskAllInputs: false });
    });

    it('does not load the SDK when telemetry is disabled', async (): Promise<void> => {
        renderConfig({ ...CONFIG, enabled: false });

        const sdk = await createTelemetry(loader.load).init();

        expect(sdk).toBeNull();
        expect(loader.loads).toBe(0);
    });

    it('does not load the SDK when the config version is unknown', async (): Promise<void> => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderConfig({ ...CONFIG, v: 2 });

        const sdk = await createTelemetry(loader.load).init();

        expect(sdk).toBeNull();
        expect(loader.loads).toBe(0);
    });

    it('starts the SDK once when called twice', async (): Promise<void> => {
        renderConfig(CONFIG);
        const telemetry = createTelemetry(loader.load);

        const [first, second] = await Promise.all([telemetry.init(), telemetry.init()]);

        expect(first).toBe(second);
        expect(loader.loads).toBe(1);
        expect(loader.sdk.configs).toHaveLength(1);
    });
});

describe('identify', () => {
    it('updates the user when the SDK runs', async (): Promise<void> => {
        renderConfig({ ...CONFIG, user: null });
        const telemetry = createTelemetry(loader.load);
        await telemetry.init();

        telemetry.identify({ id: 7, name: 'Ada Lovelace', email: 'ada@example.com' });

        expect(loader.sdk.attributes).toEqual([ADA]);
    });

    it('applies the user over the tag when called before the SDK loads', async (): Promise<void> => {
        renderConfig(CONFIG);
        const telemetry = createTelemetry(loader.load);
        const started = telemetry.init();

        telemetry.identify({ id: 9, name: 'Grace Hopper', email: null });
        await started;

        expect(loader.sdk.attributes).toEqual([{
            'user.id': '9',
            'user.name': 'Grace Hopper',
            'user.email': '',
            userId: '9',
            userName: 'Grace Hopper',
            userEmail: '',
        }]);
    });
});

describe('anonymize', () => {
    it('blanks the user attributes instead of clearing every attribute', async (): Promise<void> => {
        renderConfig(CONFIG);
        const telemetry = createTelemetry(loader.load);
        await telemetry.init();

        telemetry.anonymize();

        expect(loader.sdk.attributes.at(-1)).toEqual({
            'user.id': '',
            'user.name': '',
            'user.email': '',
            userId: '',
            userName: '',
            userEmail: '',
        });
    });

    it('drops the tag user when called before the SDK loads', async (): Promise<void> => {
        renderConfig(CONFIG);
        const telemetry = createTelemetry(loader.load);
        const started = telemetry.init();

        telemetry.anonymize();
        await started;

        expect(loader.sdk.attributes).toEqual([]);
    });
});
