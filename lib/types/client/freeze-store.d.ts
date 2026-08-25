/**
 * Session-freeze store shared by the composer freeze button (the control)
 * and the steering dock (the banner/disabled states).
 *
 * The queue is fully decoupled from freezing: freezing only stops the agent
 * from consuming the queue (the detached entries are preserved here so the
 * driver finds no pending work and stops). While frozen the entries stay
 * fully editable — text, order and the planned insertion tier (now/next/
 * later) can all change; resume re-submits the queue honoring those tiers.
 */
/** Insertion tier planned for one detached queued message. */
export type FrozenTier = 'queue' | 'safe_point' | 'force';
/** One detached queued message with its planned insertion tier. */
export interface FrozenEntry {
    text: string;
    tier: FrozenTier;
}
export interface FreezeState {
    frozen: boolean;
    /** Detached queued messages in FIFO order, each with a planned tier. */
    pending: readonly FrozenEntry[];
}
/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
export declare const freezeStore: {
    getSnapshot(): FreezeState;
    subscribe(listener: () => void): () => void;
    set(next: FreezeState): void;
};
/** Reset for tests. */
export declare function resetFreezeStore(): void;
/** Append one queued message while frozen (new input lands in the detached queue). */
export declare function pushPending(text: string, tier?: FrozenTier): void;
/** Edit one detached queued message's text in place. */
export declare function updatePendingAt(index: number, text: string): void;
/** Change one detached queued message's planned insertion tier. */
export declare function setTierAt(index: number, tier: FrozenTier): void;
/** Remove one detached queued message. */
export declare function removePendingAt(index: number): void;
/** Move one detached queued message to a new position (reorder while frozen). */
export declare function movePending(from: number, to: number): void;
//# sourceMappingURL=freeze-store.d.ts.map