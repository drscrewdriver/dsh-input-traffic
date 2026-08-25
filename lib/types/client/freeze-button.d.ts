import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SteerQueueDockInjected } from './steer-queue-dock.tsx';
/** Full props of the composer-right entry: InputZone owner share + injected verbs + locale seat. */
export type FreezeButtonProps = PropsRuntime<'conversation.input.right'> & SteerQueueDockInjected & PropsLocale<'steer'>;
/**
 * Freeze/resume toggle for the peak-hour scenario.
 * @param props - slot props; the session snapshot drives the detach list.
 */
export declare function FreezeButton({ session, updateQueue, cancel, send, sendSteer, sessionId, notify, t }: FreezeButtonProps): import("react").JSX.Element;
//# sourceMappingURL=freeze-button.d.ts.map