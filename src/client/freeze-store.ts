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

const listeners = new Set<() => void>()
let state: FreezeState = { frozen: false, pending: [] }

/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
export const freezeStore = {
  getSnapshot(): FreezeState {
    return state
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  set(next: FreezeState): void {
    state = next
    for (const listener of listeners) listener()
  },
}

/** Reset for tests. */
export function resetFreezeStore(): void {
  state = { frozen: false, pending: [] }
  for (const listener of listeners) listener()
}

/** Append one queued message while frozen (new input lands in the detached queue). */
export function pushPending(text: string, tier: FrozenTier = 'queue'): void {
  state = { ...state, pending: [...state.pending, { text, tier }] }
  emit()
}

/** Edit one detached queued message's text in place. */
export function updatePendingAt(index: number, text: string): void {
  const pending = [...state.pending]
  if (index < 0 || index >= pending.length) return
  const entry = pending[index]
  if (entry === undefined) return
  pending[index] = { ...entry, text }
  state = { ...state, pending }
  emit()
}

/** Change one detached queued message's planned insertion tier. */
export function setTierAt(index: number, tier: FrozenTier): void {
  const pending = [...state.pending]
  if (index < 0 || index >= pending.length) return
  const entry = pending[index]
  if (entry === undefined) return
  pending[index] = { ...entry, tier }
  state = { ...state, pending }
  emit()
}

/** Remove one detached queued message. */
export function removePendingAt(index: number): void {
  if (index < 0 || index >= state.pending.length) return
  state = { ...state, pending: state.pending.filter((_, i) => i !== index) }
  emit()
}

/** Move one detached queued message to a new position (reorder while frozen). */
export function movePending(from: number, to: number): void {
  if (from === to) return
  const pending = [...state.pending]
  const [moved] = pending.splice(from, 1)
  if (moved === undefined) return
  pending.splice(to, 0, moved)
  state = { ...state, pending }
  emit()
}

function emit(): void {
  for (const listener of listeners) listener()
}
