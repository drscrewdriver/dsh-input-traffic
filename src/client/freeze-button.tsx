/**
 * Session freeze/resume control, mounted in the composer's right tool row
 * (`conversation.input.right`) so it is reachable before anything queues.
 *
 * Peak-hour pause semantics: freeze does NOT interrupt the running turn —it
 * finishes naturally. The queued messages are detached (removed, preserved in
 * the shared store), so the driver finds no pending work and stops after the
 * current turn. Resume re-submits the preserved texts, waking the driver and
 * continuing the queue.
 */
import { useSyncExternalStore } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { freezeStore } from './freeze-store.ts'
import type { SteerQueueDockInjected } from './steer-queue-dock.tsx'
import css from './freeze-button.module.css'

/** Full props of the composer-right entry: InputZone owner share + injected verbs + locale seat. */
export type FreezeButtonProps = PropsRuntime<'conversation.input.right'> & SteerQueueDockInjected & PropsLocale<'steer'>

/**
 * Freeze/resume toggle for the peak-hour scenario.
 * @param props - slot props; the session snapshot drives the detach list.
 */
export function FreezeButton({ session, updateQueue, send, notify, t }: FreezeButtonProps) {
  const { frozen } = useSyncExternalStore(freezeStore.subscribe, freezeStore.getSnapshot)

  const freeze = async (): Promise<void> => {
    const queued = session.queue.filter(row => row.placement === 'queued')
    // Preserve plain-text copies; non-text rows cannot be re-sent and are
    // released by the freeze (documented limitation).
    const pending = queued.flatMap(row => row.text === null ? [] : [row.text])
    // Detach every queued row: the running turn finishes naturally, then the
    // driver finds no pending work and stops.
    await Promise.all(queued.map(row =>
      updateQueue(row.id, { kind: 'remove' }).catch(() => undefined),
    ))
    freezeStore.set({ frozen: true, pending })
  }

  const resume = async (): Promise<void> => {
    const pending = freezeStore.getSnapshot().pending
    freezeStore.set({ frozen: false, pending: [] })
    try {
      // Re-submit the preserved texts in FIFO order; the first send wakes the
      // driver and the whole chain continues.
      for (const text of pending) await send(text)
    } catch {
      notify('error', t('steer.resumeFailed'))
    }
  }

  return (
    <button
      type="button"
      className={css.freeze}
      aria-label={frozen ? t('steer.resume') : t('steer.freeze')}
      aria-pressed={frozen || undefined}
      title={frozen ? t('steer.frozen') : undefined}
      onClick={() => {
        if (frozen) void resume()
        else void freeze()
      }}
    >
      <span className={css.label}>{frozen ? t('steer.resume') : t('steer.freeze')}</span>
    </button>
  )
}
