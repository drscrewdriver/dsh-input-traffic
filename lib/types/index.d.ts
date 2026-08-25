/**
 * dsh-input-traffic —node half.
 *
 * The node half is the Loader entry every client plugin must ship; it carries
 * no host-side behavior. The browser half (src/client/index.ts) owns the
 * whole takeover: the three-tier planning dock and the busy-Enter row hiding.
 */
import type { Context } from '@deepseek-ai/cordis';
/** @param ctx - host-side context; intentionally unused (client-plugin shape). */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map