/**
 * Session-scoped freeze store shared by the composer freeze button (the
 * control) and the steering dock (the banner/disabled states).
 *
 * The queue is fully decoupled from freezing: freezing only stops the agent
 * from consuming the queue (the detached entries are preserved here so the
 * driver finds no pending work and stops). While frozen the entries stay
 * fully editable — text, order and the planned insertion tier (now/next/
 * later) can all change; resume re-submits the queue honoring those tiers.
 *
 * State is keyed by session id so freezing one session never leaks into
 * another: each session holds its own `frozen` flag and detached queue, and
 * mutating one session's queue only re-renders that session's consumers
 * (`useSyncExternalStore` bails on unchanged references for the others).
 */
/** Session id → per-session freeze state. */
const states = new Map();
const listeners = new Set();
/** Stable empty snapshot: `useSyncExternalStore` needs a reference-stable
 *  value for unset sessions so unchanged consumers never re-render. */
const EMPTY = { frozen: false, pending: [] };
/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
export const freezeStore = {
    /** Snapshot for one session; reference-stable until that session changes. */
    getSnapshot(sessionId) {
        return states.get(sessionId) ?? EMPTY;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
    /** Replace one session's state; unset sessions fall back to EMPTY. */
    set(sessionId, next) {
        if (next.frozen === false && next.pending.length === 0) {
            states.delete(sessionId);
        }
        else {
            states.set(sessionId, next);
        }
        emit();
    },
};
/** Reset all sessions (for tests). */
export function resetFreezeStore() {
    states.clear();
    emit();
}
/** Append one queued message while frozen (new input lands in the detached queue). */
export function pushPending(sessionId, text, tier = 'queue') {
    const cur = states.get(sessionId) ?? EMPTY;
    freezeStore.set(sessionId, { ...cur, pending: [...cur.pending, { text, tier }] });
}
/**
 * Write a mutated pending list back, keeping the session's own `frozen` flag.
 *
 * The four mutators below used to hard-code `frozen: true`, which is wrong for
 * the one case that empties the list: removing the last pending entry left
 * `{ frozen: true, pending: [] }` behind — the banner stayed up forever while
 * new messages went straight through, a pure display residue (issue #5, defect
 * 2). `freezeStore.set` already deletes the session when `frozen === false` and
 * the list is empty, so deriving the flag here is all that is needed: the queue
 * emptying is what unfreezes, and an explicit freeze/resume still owns the flag
 * in every non-empty case.
 */
function writePending(sessionId, pending) {
    const cur = states.get(sessionId) ?? EMPTY;
    freezeStore.set(sessionId, { frozen: cur.frozen && pending.length > 0, pending });
}
/** Edit one detached queued message's text in place. */
export function updatePendingAt(sessionId, index, text) {
    const pending = states.get(sessionId)?.pending;
    if (pending === undefined)
        return;
    const entry = pending[index];
    if (entry === undefined)
        return;
    const next = [...pending];
    next[index] = { ...entry, text };
    writePending(sessionId, next);
}
/** Change one detached queued message's planned insertion tier. */
export function setTierAt(sessionId, index, tier) {
    const pending = states.get(sessionId)?.pending;
    if (pending === undefined)
        return;
    const entry = pending[index];
    if (entry === undefined)
        return;
    const next = [...pending];
    next[index] = { ...entry, tier };
    writePending(sessionId, next);
}
/** Remove one detached queued message. */
export function removePendingAt(sessionId, index) {
    const pending = states.get(sessionId)?.pending;
    if (pending === undefined)
        return;
    writePending(sessionId, pending.filter((_, i) => i !== index));
}
/** Move one detached queued message to a new position (reorder while frozen). */
export function movePending(sessionId, from, to) {
    if (from === to)
        return;
    const pending = states.get(sessionId)?.pending;
    if (pending === undefined)
        return;
    const next = [...pending];
    const [moved] = next.splice(from, 1);
    if (moved === undefined)
        return;
    next.splice(to, 0, moved);
    writePending(sessionId, next);
}
function emit() {
    for (const listener of listeners)
        listener();
}
//# sourceMappingURL=freeze-store.js.map