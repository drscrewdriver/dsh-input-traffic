/**
 * 家族容器兜底接管 own 卡内联直挂契约（2026-11-02 own-tab 批量修复新增）。
 *
 * 与 dsh-brief-sidebar 的同名用例对齐：input-traffic 携带**自己一份** family-host
 * 模块拷贝，故必须本仓独立证成，而非借用姊妹仓结论。三条钉住：
 *  1. claim 的接管 inject 面暴露 renderOwn/ownId，且 renderOwn 返回本插件 own 组件；
 *  2. 空账本时 FamilyHostSection 仍内联渲染 own 卡（孤儿接管不再空白）；
 *  3. own id 已在账本时去重，绝不双渲、且不经 renderSlot 二次渲染 own。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  FAMILY_CLAIM_DELAY_MS,
  FamilyHostSection,
  claimFamilyHostIfOrphaned,
} from '../src/client/family-host'
import type { FamilyHostSlots } from '../src/client/family-host'

function fakeSlots(options: { entries?: unknown[] } = {}) {
  const registered: { options: Record<string, unknown>; component: unknown }[] = []
  const slots: FamilyHostSlots = {
    inject: () => undefined,
    register: (opts, component) => {
      registered.push({ options: opts, component })
      return () => undefined
    },
    entries: () => (options.entries ?? []) as never,
    subscribe: () => () => undefined,
  }
  return { slots, registered }
}

function OwnCard() {
  return createElement('span', null, 'OWN-CARD')
}

describe('input-traffic family host own-tab inline (orphan takeover mounts own card)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('claim exposes renderOwn/ownId returning the own component', () => {
    const { slots, registered } = fakeSlots()
    claimFamilyHostIfOrphaned(slots, () => false, () => 'x', '[t]', { id: 'input-traffic', component: OwnCard, inject: () => ({}) })
    vi.advanceTimersByTime(FAMILY_CLAIM_DELAY_MS + 10)
    expect(registered).toHaveLength(1)
    const face = (registered[0]!.options['inject'] as () => Record<string, unknown>)()
    expect(face['ownId']).toBe('input-traffic')
    expect(typeof face['renderOwn']).toBe('function')
    expect((face['renderOwn'] as () => { type: unknown })().type).toBe(OwnCard)
  })

  it('FamilyHostSection renders the own card even when the ledger is empty', () => {
    const html = renderToStaticMarkup(
      createElement(FamilyHostSection, {
        hooks: { tabs: { getSnapshot: () => [], subscribe: () => () => {} } },
        renderOwn: () => createElement('span', null, 'OWN-CARD'),
        ownId: 'input-traffic',
      } as never),
    )
    expect(html).toContain('OWN-CARD')
  })

  it('dedups: own id already seated is inlined once, never via renderSlot', () => {
    const slotCalls: string[] = []
    const html = renderToStaticMarkup(
      createElement(FamilyHostSection, {
        hooks: { tabs: { getSnapshot: () => [{ id: 'input-traffic', order: 50, label: 'i' }, { id: 'other', order: 60, label: 'o' }], subscribe: () => () => {} } },
        renderSlot: (_k: string, _o: unknown, opts?: { only?: string }) => {
          slotCalls.push(String(opts?.only))
          return createElement('span', null, 'LEDGER:' + String(opts?.only))
        },
        renderOwn: () => createElement('span', null, 'OWN-CARD'),
        ownId: 'input-traffic',
      } as never),
    )
    expect((html.match(/OWN-CARD/g) || []).length).toBe(1)
    expect(slotCalls).not.toContain('input-traffic')
    expect(slotCalls).toContain('other')
  })
})
