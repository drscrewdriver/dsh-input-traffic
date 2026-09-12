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
 * ORDERING (why the dock registers at QUEUE_DOCK_ORDER instead of the
 * official dock's 20): a list slot's DISPLAY position is decided by `order`
 * alone — `ui-renderer/src/client/scoped-slots.tsx` maps the shadowing
 * winners to rows and then sorts them by `order` — while `priority` only
 * decides which entry wins a shared cell id. Keeping the official 20
 * therefore left the strip above any later contributor (dsh-perm-gate's
 * notice registers order 30), which pushed that notice between the queue
 * strip and the composer card. A deliberately high order keeps the strip
 * adjacent to the card; priority stays -1 so the cell takeover still holds.
 * Known `conversation.input.dock` contributors on 0.1.5-rc.2: `todo` 0,
 * `goal` 10, official `queue` 20, `dsh-perm-gate.notice` 30. Note 0.1.5 also
 * introduces adjacent slots (`conversation.composer.dock`,
 * `conversation.input.left`) — a third party registering a larger `order`
 * inside this slot could still land below us.
 *
 * All @deepseek-ai/* imports are type-only: collaboration happens through
 * cordis services and slot registration only (client bundle purity).
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/**
 * Display order of the queue strip inside `conversation.input.dock`.
 *
 * List rows render sorted by `order` ascending, so a value above every other
 * contributor keeps the strip as the bottom-most entry of the band — directly
 * on top of the composer card. Known contributors on 0.1.5-rc.2: `todo` 0,
 * `goal` 10, official `queue` 20, `dsh-perm-gate.notice` 30. DSH has no "last"
 * slot semantics, so this is a convention, not a
 * structural guarantee: a third party registering a larger value could still
 * land below us.
 */
export declare const QUEUE_DOCK_ORDER = 1000;
/** Services required by the browser half. */
export declare const inject: string[];
/**
 * Client plugin body: dictionaries, busy-Enter pinning, and the two slot
 * shadowings.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map