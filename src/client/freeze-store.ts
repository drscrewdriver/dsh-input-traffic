/**
 * Session-freeze store shared by the composer freeze button (the control)
 * and the steering dock (the banner/disabled states).
 *
 * Freeze semantics (peak-hour pause): the current turn is NOT interrupted —
 * it finishes naturally; the queued messages are detached (removed) and
 * preserved here, so the driver finds no pending work and stops. Resume
 * re-submits the preserved texts, which wakes the driver and continues the
 * queue.
 */
export interface FreezeState {
  frozen: boolean
  /** Plain-text copies of the detached queued messages, in FIFO order. */
  pending: readonly string[]
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
