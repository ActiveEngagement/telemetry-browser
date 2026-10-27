// @vitest-environment node
import { expect, it } from 'vitest';

import { createTelemetry } from '../src/telemetry.js';
import { SdkLoaderSpy } from './doubles/SdkSpy.js';
import { CONFIG } from './support.js';

it('does not load the SDK when it runs on the server', async (): Promise<void> => {
    const loader = new SdkLoaderSpy();

    const sdk = await createTelemetry(loader.load).init({ config: CONFIG });

    expect(sdk).toBeNull();
    expect(loader.loads).toBe(0);
});
