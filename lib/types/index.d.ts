/**
 * dsh-input-traffic — node half.
 *
 * Historically a deliberate no-op (pure client takeover shape). T20-b gave it
 * one real job: host the settings bridge. The browser half's durable data
 * plane (the `ui-conversation` busy-Enter pin) rides generation-exclusive
 * client settings handles that are a dead end ≤0.1.5 (the A2 posture), so the
 * node half exposes the host settings service over the plugin's webServer as
 * a describe/mutate route pair (src/bridge.ts, perm-gate 5260fe6 generalized
 * form) — see src/client/bridge-scope.ts for the consumer.
 *
 * Inject posture: `webServer` is loader-level (present on every kept line —
 * the web profile serves the UI through it); `settings` resolves via a child
 * effect so a host without it leaves the ref unset and the bridge degrades to
 * `settings-unavailable` responses instead of failing the entry.
 */
import type { Context } from '@deepseek-ai/cordis';
/** webServer hosts the bridge route pair. */
export declare const inject: string[];
/** @param ctx - host-side context; registers the bridge route pair. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map