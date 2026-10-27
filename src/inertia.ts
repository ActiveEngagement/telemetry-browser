import type { Page, Router } from '@inertiajs/core';

import type { TelemetryUser } from './config.js';
import defaultTelemetry from './index.js';
import type { Telemetry } from './telemetry.js';

export type TrackUserOptions = {
    /** Where the page keeps the user. Defaults to the `telemetry.user` prop laravel-telemetry shares. */
    user?: (page: Page) => TelemetryUser | null | undefined;
    telemetry?: Pick<Telemetry, 'identify' | 'anonymize'>;
};

function sharedUser(page: Page): TelemetryUser | null | undefined {
    return (page.props.telemetry as { user?: TelemetryUser | null } | undefined)?.user;
}

/** Keeps the identified user current across Inertia visits, such as a login or a logout. */
export function trackInertiaUser(
    router: Pick<Router, 'on'>,
    { user = sharedUser, telemetry = defaultTelemetry }: TrackUserOptions = {},
): VoidFunction {
    let currentId: string | null = null;

    return router.on('navigate', (event) => {
        const next = user(event.detail.page) ?? null;
        const nextId = next === null ? null : String(next.id);

        if (nextId === currentId) {
            return;
        }

        currentId = nextId;

        if (next === null) {
            telemetry.anonymize();
        } else {
            telemetry.identify(next);
        }
    });
}
