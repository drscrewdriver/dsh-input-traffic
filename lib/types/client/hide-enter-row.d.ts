/**
 * Busy-Enter row hiding: shadows the official `settings.general.item` entry
 * `composer-enter` (same cell id, priority -1) so the lower priority wins and
 * the official "繁忙时 Enter 键行为" row never renders while this plugin is
 * mounted.
 *
 * The behavior itself is taken over by the plugin: plain Enter stays
 * queue-later (green), the planning dock owns yellow/red, and the plugin apply
 * pins `ui-conversation.busyEnter` to `queue` so no stale preference can
 * leak through the hidden row.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Full props of a settings-row entry (unused: the row renders nothing). */
export type HideEnterRowProps = PropsRuntime<'settings.general.item'> & PropsLocale<'steer'>;
/** Render nothing: the official busy-Enter row is hidden while mounted. */
export declare function HideEnterRow(_props: HideEnterRowProps): null;
//# sourceMappingURL=hide-enter-row.d.ts.map