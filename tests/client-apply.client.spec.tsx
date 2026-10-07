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
 *
 * The settings-face tests cover the compat waist's three postures: modern
 * hosts (`configForms`), pre-0.1.7 hosts (`settingsScope`), and hosts with
 * neither (the plugin must stay inert on that face, never throw).
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

/** Which durable-settings service the fake host carries. */
type SettingsLine = 'configForms' | 'settingsScope' | 'none'

/** One recorded busy-Enter pin. */
interface PinRecord { via: SettingsLine; namespace: string; field: string; value: unknown }

/**
 * Build a client root context that records every `slots.register` call and
 * every settings pin. `inject(services, cb)` mimics cordis: the callback runs
 * synchronously with the resolved services when all of them exist, and the
 * fiber merely pends (callback never runs) when one is missing.
 */
function makeCtx(settings: SettingsLine = 'configForms'): {
  ctx: ClientContext
  registrations: Registration[]
  pins: PinRecord[]
} {
  const registrations: Registration[] = []
  const pins: PinRecord[] = []
  const recordPin = (via: SettingsLine) => (specOrNs: { namespace: string } | string) => {
    const namespace = typeof specOrNs === 'string' ? specOrNs : specOrNs.namespace
    return {
      set: async (field: string, value: unknown): Promise<boolean> => {
        pins.push({ via, namespace, field, value })
        return true
      },
      getSnapshot: () => ({ status: 'ready', value: { busyEnter: 'queue' }, writable: true }),
      subscribe: () => () => {},
    }
  }
  const services: Record<string, unknown> = {}
  if (settings === 'configForms') services.configForms = { get: recordPin('configForms') }
  if (settings === 'settingsScope') services.settingsScope = { bind: recordPin('settingsScope') }
  const ctx = {
    effect: (fn: () => unknown): (() => void) => {
      const cleanup = fn()
      return typeof cleanup === 'function' ? cleanup : () => {}
    },
    on: () => () => {},
    get: () => undefined,
    inject: (names: string[], cb: (...resolved: unknown[]) => void): (() => void) => {
      // cordis 真实形态：回调收到 scope 对象（服务按名取），不是裸服务。
      if (names.every((n) => services[n] !== undefined)) {
        cb(Object.fromEntries(names.map((n) => [n, services[n]])))
      }
      return () => {}
    },
    locale: { register: () => {}, bind: () => (key: string) => key },
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
  return { ctx: ctx as unknown as ClientContext, registrations, pins }
}

describe('client apply()', () => {
  it('registers the takeover slots plus the family settings tab (modern host)', () => {
    const { ctx, registrations } = makeCtx()
    apply(ctx)
    expect([...registrations.map(r => r.name)].sort()).toEqual([
      'conversation.input.dock',
      'conversation.input.right',
      'dsh-family.tab',
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

  it('pins busyEnter through configForms on modern hosts and never touches settingsScope', () => {
    const { ctx, pins } = makeCtx('configForms')
    apply(ctx)
    expect(pins).toEqual([
      { via: 'configForms', namespace: 'ui-conversation', field: 'busyEnter', value: 'queue' },
    ])
  })

  it('pins busyEnter through settingsScope on pre-0.1.7 hosts', () => {
    const { ctx, pins, registrations } = makeCtx('settingsScope')
    apply(ctx)
    expect(pins).toEqual([
      { via: 'settingsScope', namespace: 'ui-conversation', field: 'busyEnter', value: 'queue' },
    ])
    // The family tab still registers — against the bind() scope.
    expect(registrations.map(r => r.name)).toContain('dsh-family.tab')
  })

  it('family tab registers unconditionally (degraded, no scope) when neither service exists', () => {
    // 2026-10-07 修复后契约：family.tab 是跨插件槽位（thinking-levels/接管节
    // 的 dsh-family.tab 账本），注册不依赖本仓的 settings 面——≤0.1.5 上
    // settingsScope 永不 resolve 曾把注册关进 onScope 回调导致家族节整节空白。
    // 现注册无条件执行，scope 缺席由卡片自身降级（只读说明态）。
    const { ctx, pins, registrations } = makeCtx('none')
    expect(() => apply(ctx)).not.toThrow()
    expect(pins).toEqual([])
    const family: any = registrations.find(r => r.name === 'dsh-family.tab')
    expect(family).toBeDefined()
    // inject 现读活引用：scope 未解析时传 undefined（卡降级渲染）。
    const face = (family!['inject'] as () => Record<string, unknown>)()
    expect(face['scope']).toBeUndefined()
    expect(registrations.map(r => r.name)).toEqual([
      'dsh-family.tab',
      'conversation.input.dock',
      'conversation.input.right',
      'settings.general.item',
    ])
  })
})
