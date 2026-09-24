/**
 * Registration-shape tests for the client `apply()`.
 *
 * The queue strip must BOTH win the official `queue` cell and render as the
 * bottom-most entry of the `conversation.input.dock` band, because those are
 * two independent mechanisms: a list slot's display position is decided by
 * `order` alone (`ui-renderer/src/client/scoped-slots.tsx` sorts the shadowing
 * winners by `order`), while `priority` only picks the winner of a shared cell
 * id. Regression guard for dsh-perm-gate's notice strip (order 30) landing
 * between the queue strip and the composer card.
 */
import { describe, expect, it } from 'vitest'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { apply, QUEUE_DOCK_ORDER } from '../src/client/index.ts'

/** The registration options this plugin passes; a subset of the slot contract. */
interface Registration {
  name: string
  id?: string
  order?: number
  priority?: number
}

/**
 * Build a client root context that records every `slots.register` call.
 * @returns the context (cast to the declared client shape) plus the ledger.
 */
function makeCtx(): { ctx: ClientContext; registrations: Registration[] } {
  const registrations: Registration[] = []
  const ctx = {
    effect: (fn: () => unknown): (() => void) => {
      const cleanup = fn()
      return typeof cleanup === 'function' ? cleanup : () => {}
    },
    on: () => () => {},
    get: () => undefined,
    locale: { register: () => {}, bind: () => (key: string) => key },
    configForms: { get: () => ({ set: async () => true }) },
    slots: {
      inject: (_name: string, fn: () => unknown) => {
        fn()
        return () => {}
      },
      register: (options: Registration) => {
        registrations.push(options)
        return () => {}
      },
    },
    sessions: { scope: () => undefined },
  }
  return { ctx: ctx as unknown as ClientContext, registrations }
}

describe('client apply()', () => {
  it('registers the three takeover slots', () => {
    const { ctx, registrations } = makeCtx()
    apply(ctx)
    expect(registrations.map(r => r.name)).toEqual([
      'conversation.input.dock',
      'conversation.input.right',
      'settings.general.item',
    ])
  })

  it('wins the official queue cell and renders bottom-most in the band', () => {
    const { ctx, registrations } = makeCtx()
    apply(ctx)
    const dock = registrations.find(r => r.name === 'conversation.input.dock')
    expect(dock).toBeDefined()
    // The cell id is what shadows the official dock…
    expect(dock?.id).toBe('queue')
    // …priority -1 beats the official entry registered at the default 0…
    expect(dock?.priority).toBe(-1)
    // …and the display position comes from `order` alone, so it must clear
    // every known contributor of the band in BOTH releases: todo 0,
    // goal 10, official queue 20, dsh-perm-gate.notice 30.
    expect(dock?.order).toBe(QUEUE_DOCK_ORDER)
    expect(dock?.order).toBeGreaterThan(30)
  })

  it('mounts the freeze control without an owner-share dependency', () => {
    const { ctx, registrations } = makeCtx()
    apply(ctx)
    const right = registrations.find(r => r.name === 'conversation.input.right')
    expect(right).toBeDefined()
    // No `inject` owner data is requested for this slot beyond the session
    // scope; the 0.1.2 skeleton renders it with `{}`.
    expect(right?.priority).toBeUndefined()
  })

  it('shadows the official busy-Enter settings row', () => {
    const { ctx, registrations } = makeCtx()
    apply(ctx)
    const row = registrations.find(r => r.name === 'settings.general.item')
    expect(row?.id).toBe('composer-enter')
    expect(row?.priority).toBe(-1)
  })
})
