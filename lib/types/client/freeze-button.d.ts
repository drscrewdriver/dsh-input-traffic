import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SteerQueueDockInjected } from './steer-queue-dock.tsx';
/**
 * Full props of the composer-right entry.
 *
 * DUAL-VERSION: 0.1.1 delivers the `InputZone` owner share here, 0.1.2 renders
 * the slot with `{}` (`InputBar.tsx:466`). Only the session standard kit is
 * shared, so the type declares exactly that — reading `session`/`input` off
 * this slot is a compile error, not a 0.1.2 crash.
 */
export type FreezeButtonProps = Pick<PropsRuntime<'conversation.input.right'>, 'useSession' | 'sessionId'> & SteerQueueDockInjected & PropsLocale<'steer'>;
/**
 * Freeze/resume toggle for the peak-hour scenario.
 * @param props - slot props; the session snapshot drives the detach list.
 */
export declare function FreezeButton({ useSession, updateQueue, cancel, send, sendSteer, sessionId, setComposerBlock, notify, t }: FreezeButtonProps): import("react").JSX.Element;
//# sourceMappingURL=freeze-button.d.ts.map