/**
 * dsh-input-traffic —browser half.
 *
 * The whole takeover lives here:
 * 1. registers the `steer` dictionaries;
 * 2. pins `ui-conversation.busyEnter` to `queue` (plain Enter = green later)
 *    so the hidden official row cannot leak a stale queue/steer preference;
 * 3. shadows the official queue dock (`conversation.input.dock` cell id
 *    `queue`, priority -1) with the three-tier planning strip;
 * 4. shadows the official busy-Enter settings row (`settings.general.item`
 *    cell id `composer-enter`, priority -1) with a null render.
 *
 * All @deepseek-ai/* imports are type-only: collaboration happens through
 * cordis services and slot registration only (client bundle purity).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Services required by the browser half. */
export declare const inject: string[];
/**
 * Client plugin body: dictionaries, busy-Enter pinning, and the two slot
 * shadowings.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map