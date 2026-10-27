import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseConfig, readConfig } from '../src/config.js';
import { CONFIG, renderConfig, renderTag } from './support.js';

beforeEach((): void => {
    document.head.innerHTML = '';
});

describe('readConfig', () => {
    it('reads the config when the page has the tag', (): void => {
        renderConfig(CONFIG);

        const config = readConfig();

        expect(config).toEqual(CONFIG);
    });

    it('returns null and warns when the page has no tag', (): void => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const config = readConfig();

        expect(config).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('No #telemetry-config tag'));
    });

    it('returns null and warns when the tag is not JSON', (): void => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderTag('{"v": 1,');

        const config = readConfig();

        expect(config).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('not valid JSON'), expect.any(SyntaxError));
    });
});

describe('parseConfig', () => {
    it('returns null and warns when the version is unknown', (): void => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const config = parseConfig({ ...CONFIG, v: 2 });

        expect(config).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Config version 2 is not supported'));
    });
});
