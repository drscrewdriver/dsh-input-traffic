import { registerSettingsBridgeRoutes } from './bridge.js';
/** The settings namespace the browser half pins (`ui-conversation.busyEnter`). */
const BRIDGE_NS = 'ui-conversation';
/** webServer hosts the bridge route pair. */
export const inject = ['webServer'];
/** @param ctx - host-side context; registers the bridge route pair. */
export function apply(ctx) {
    // Live settings ref: the child effect keeps entry activation independent of
    // the service (a host without settings just gets settings-unavailable).
    const settingsRef = {};
    ctx.inject(['settings'], (child) => {
        // cordis inject callbacks receive (ctx, config) — read services off the
        // scope object by name (the waist-wide convention; bare-service calls are
        // a TypeError on every generation).
        settingsRef.svc = child.settings;
    });
    // Register + unregister the route pair with the entry's life cycle. The
    // webServer comes from the loader inject, with a ctx.get fallback for hosts
    // that resolve services lazily (same posture as dsh-perm-gate).
    ctx.effect(() => {
        const injected = ctx;
        const webServer = injected.webServer ?? injected.get?.('webServer');
        const offs = registerSettingsBridgeRoutes(webServer, () => settingsRef.svc, BRIDGE_NS);
        return () => { for (const off of offs)
            off(); };
    }, 'dsh-input-traffic: settings bridge routes');
}
//# sourceMappingURL=index.js.map