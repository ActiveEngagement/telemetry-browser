import type { TelemetryUser } from './config.js';

/** The OTel `user.*` keys the server writes, and the old keys the HyperDX Sessions UI reads. */
export function userAttributes(user: TelemetryUser): Record<string, string> {
    const id = String(user.id);
    const name = user.name ?? '';
    const email = user.email ?? '';

    return {
        'user.id': id,
        'user.name': name,
        'user.email': email,
        userId: id,
        userName: name,
        userEmail: email,
    };
}

/** Blank, not removed: `setGlobalAttributes()` called empty clears every global attribute. */
export const ANONYMOUS_ATTRIBUTES = userAttributes({ id: '', name: '', email: '' });
