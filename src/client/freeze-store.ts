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

/** Insertion tier planned for one detached queued message. */
export type FrozenTier = 'queue' | 'safe_point' | 'force'

/** One detached queued message with its planned insertion tier. */
export interface FrozenEntry {
  text: string
  tier: FrozenTier
}

export interface FreezeState {
  frozen: boolean
  /** Detached queued messages in FIFO order, each with a planned tier. */
  pending: readonly FrozenEntry[]
}

/** Session id → per-session freeze state. */
const states = new Map<string, FreezeState>()
const listeners = new Set<() => void>()

/** Stable empty snapshot: `useSyncExternalStore` needs a reference-stable
 *  value for unset sessions so unchanged consumers never re-render. */
const EMPTY: FreezeState = { frozen: false, pending: [] }

/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
export const freezeStore = {
  /** Snapshot for one session; reference-stable until that session changes. */
  getSnapshot(sessionId: string): FreezeState {
    return states.get(sessionId) ?? EMPTY
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  /** Replace one session's state; unset sessions fall back to EMPTY. */
  set(sessionId: string, next: FreezeState): void {
    if (next.frozen === false && next.pending.length === 0) {
      states.delete(sessionId)
    } else {
      states.set(sessionId, next)
    }
    emit()
  },
}

/** Reset all sessions (for tests). */
export function resetFreezeStore(): void {
  states.clear()
  emit()
}

/** Append one queued message while frozen (new input lands in the detached queue). */
export function pushPending(sessionId: string, text: string, tier: FrozenTier = 'queue'): void {
  const cur = states.get(sessionId) ?? EMPTY
  freezeStore.set(sessionId, { ...cur, pending: [...cur.pending, { text, tier }] })
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
function writePending(sessionId: string, pending: readonly FrozenEntry[]): void {
  const cur = states.get(sessionId) ?? EMPTY
  freezeStore.set(sessionId, { frozen: cur.frozen && pending.length > 0, pending })
}

/** Edit one detached queued message's text in place. */
export function updatePendingAt(sessionId: string, index: number, text: string): void {
  const pending = states.get(sessionId)?.pending
  if (pending === undefined) return
  const entry = pending[index]
  if (entry === undefined) return
  const next = [...pending]
  next[index] = { ...entry, text }
  writePending(sessionId, next)
}

/** Change one detached queued message's planned insertion tier. */
export function setTierAt(sessionId: string, index: number, tier: FrozenTier): void {
  const pending = states.get(sessionId)?.pending
  if (pending === undefined) return
  const entry = pending[index]
  if (entry === undefined) return
  const next = [...pending]
  next[index] = { ...entry, tier }
  writePending(sessionId, next)
}

/** Remove one detached queued message. */
export function removePendingAt(sessionId: string, index: number): void {
  const pending = states.get(sessionId)?.pending
  if (pending === undefined) return
  writePending(sessionId, pending.filter((_, i) => i !== index))
}

/** Move one detached queued message to a new position (reorder while frozen). */
export function movePending(sessionId: string, from: number, to: number): void {
  if (from === to) return
  const pending = states.get(sessionId)?.pending
  if (pending === undefined) return
  const next = [...pending]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) return
  next.splice(to, 0, moved)
  writePending(sessionId, next)
}

function emit(): void {
  for (const listener of listeners) listener()
}
