import type { GlobalEvent, GlobalEventNames, GlobalEventResult, Page, PageProps, Router } from '@inertiajs/core';

type NavigateListener = (event: GlobalEvent<'navigate'>) => void;

export class RouterFake implements Pick<Router, 'on'> {
    private listeners: NavigateListener[] = [];

    on<TEventName extends GlobalEventNames>(
        type: TEventName,
        callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
    ): VoidFunction {
        if (type !== 'navigate') {
            throw new Error(`RouterFake only dispatches navigate, not ${type}.`);
        }

        const listener = callback as NavigateListener;
        this.listeners.push(listener);

        return () => {
            this.listeners = this.listeners.filter((each) => each !== listener);
        };
    }

    navigate(props: PageProps): void {
        const page: Page = {
            component: 'Dashboard',
            props: { errors: {}, ...props },
            url: '/',
            version: null,
            rescuedProps: [],
            flash: {},
            rememberedState: {},
        };

        const event = new CustomEvent('inertia:navigate', { detail: { page, type: 'visit' as const } });

        this.listeners.forEach((listener) => listener(event));
    }
}
