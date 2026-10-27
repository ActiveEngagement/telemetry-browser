import { beforeEach, describe, expect, it } from 'vitest';

import { trackInertiaUser } from '../src/inertia.js';
import { IdentitySpy } from './doubles/IdentitySpy.js';
import { RouterFake } from './doubles/RouterFake.js';

const ADA = { id: 7, name: 'Ada Lovelace', email: 'ada@example.com' };
const GRACE = { id: 9, name: 'Grace Hopper', email: 'grace@example.com' };

let router: RouterFake;
let telemetry: IdentitySpy;

beforeEach((): void => {
    router = new RouterFake();
    telemetry = new IdentitySpy();
});

describe('trackInertiaUser', () => {
    it('identifies the user when laravel-telemetry shares one', (): void => {
        trackInertiaUser(router, { telemetry });

        router.navigate({ telemetry: { user: ADA } });

        expect(telemetry.calls).toEqual([{ identify: ADA }]);
    });

    it('does nothing when a guest opens a page', (): void => {
        trackInertiaUser(router, { telemetry });

        router.navigate({ telemetry: { user: null } });

        expect(telemetry.calls).toEqual([]);
    });

    it('does not identify again while the user id stays the same', (): void => {
        trackInertiaUser(router, { telemetry });
        router.navigate({ telemetry: { user: ADA } });

        router.navigate({ telemetry: { user: { ...ADA, name: 'Ada King' } } });

        expect(telemetry.calls).toEqual([{ identify: ADA }]);
    });

    it('identifies the new user when the user changes', (): void => {
        trackInertiaUser(router, { telemetry });
        router.navigate({ telemetry: { user: ADA } });

        router.navigate({ telemetry: { user: GRACE } });

        expect(telemetry.calls).toEqual([{ identify: ADA }, { identify: GRACE }]);
    });

    it('anonymizes when the user logs out', (): void => {
        trackInertiaUser(router, { telemetry });
        router.navigate({ telemetry: { user: ADA } });

        router.navigate({ telemetry: { user: null } });

        expect(telemetry.calls).toEqual([{ identify: ADA }, 'anonymize']);
    });

    it('reads the user from another prop when the app says where', (): void => {
        trackInertiaUser(router, {
            telemetry,
            user: (page) => (page.props.auth as { user: typeof ADA }).user,
        });

        router.navigate({ auth: { user: ADA } });

        expect(telemetry.calls).toEqual([{ identify: ADA }]);
    });

    it('stops listening when unsubscribed', (): void => {
        const stop = trackInertiaUser(router, { telemetry });

        stop();
        router.navigate({ telemetry: { user: ADA } });

        expect(telemetry.calls).toEqual([]);
    });
});
