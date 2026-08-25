import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** One mutation accepted by the conversation queue verb. */
export type SteerQueueAction = {
    kind: 'edit';
    content: readonly {
        type: 'text';
        text: string;
    }[];
} | {
    kind: 'remove';
} | {
    kind: 'steer';
};
/** Queue operations injected by the session-scoped registration. */
export interface SteerQueueDockInjected {
    updateQueue: (itemId: string, action: SteerQueueAction) => Promise<void>;
    /** Cancel the current turn while preserving the pending queue. */
    cancel: () => Promise<void>;
    /** Re-send one plain-text message as a queued follow-up (the revoke path). */
    send: (text: string) => Promise<void>;
    /** Steer one plain-text message into the session's next step (resume's safe_point tier). */
    sendSteer?: (text: string) => Promise<void>;
    /** Back-fill the composer draft (the pull-back-to-composer edit path). */
    setDraft: (text: string) => void;
    notify: (level: 'info' | 'error', text: string) => void;
    /** Owning session id (for the dsh-session-guard bridge RPC). */
    sessionId?: string;
}
/** Full props of a dock entry: InputZone owner share + session standard kit + global seat + the locale seat. */
export type SteerQueueDockProps = PropsRuntime<'conversation.input.dock'> & SteerQueueDockInjected & PropsLocale<'steer'>;
/** The planning tier of one queued row. */
export type SteerTier = 'now' | 'next' | 'later';
/**
 * Resolve the action sequence for one planning button press. Pure so the
 * button wiring and its tests share one truth.
 * @param tier - the pressed planning tier.
 * @returns the queue mutation (red re-uses a steer-shaped action for the
 * yellow branch; the red branch performs cancel + remove + resend instead).
 */
export declare function planActionFor(tier: SteerTier): {
    action: SteerQueueAction;
    interruptFirst: boolean;
};
/**
 * Project the tier badge of one inbox row from its placement. Pure so the
 * row rendering and its tests share one truth.
 * @param placement - the inbox projection placement.
 * @returns the tier badge, or null for non-visible context rows.
 */
export declare function badgeFor(placement: 'queued' | 'steering' | 'context'): SteerTier | null;
/**
 * Auto-grow one edit textarea to its content. The CSS max-height caps the
 * growth; beyond it the textarea scrolls internally. Height is reset first so
 * shrink (deleting lines) also tracks the content.
 * @param el - the textarea to resize in place.
 */
export declare function resizeEditor(el: HTMLTextAreaElement): void;
/**
 * Queue strip with three-tier planning: one item renders directly; multiple
 * items default to a collapsible count header; an empty queue renders nothing.
 */
export declare function SteerQueueDock({ useSession, input, updateQueue, cancel, send, setDraft, notify, t }: SteerQueueDockProps): import("react").JSX.Element | null;
//# sourceMappingURL=steer-queue-dock.d.ts.map