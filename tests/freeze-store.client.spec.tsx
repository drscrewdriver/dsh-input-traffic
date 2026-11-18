/**
 * freeze-store 的纯函数契约（issue #5 次生缺陷 2）。
 *
 * 四个 mutator 曾经把 `frozen` 硬编码成 `true`，于是「删掉最后一条 pending」
 * 会留下 `{ frozen: true, pending: [] }` —— 徽标永不消失，而新消息照发，
 * 纯显示残留。这里钉的是「队列空即解冻」这个不变量，以及它的反面：
 * 非空时 mutator 不得篡改用户显式设的冻结态。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  freezeStore,
  movePending,
  pushPending,
  removePendingAt,
  resetFreezeStore,
  setTierAt,
  updatePendingAt,
} from '../src/client/freeze-store.ts'

beforeEach(() => {
  resetFreezeStore()
})

describe('删空队列必须解冻', () => {
  it('removePendingAt 删掉最后一条后回到未冻结（不是卡在 frozen:true / pending:[]）', () => {
    freezeStore.set('s1', { frozen: true, pending: [{ text: '仅此一条', tier: 'queue' }] })
    removePendingAt('s1', 0)
    // `freezeStore.set` 在 frozen=false 且空列表时直接删掉这个会话，
    // 所以快照回落成稳定 EMPTY —— 两者等价，但这里断言的是语义结果。
    expect(freezeStore.getSnapshot('s1')).toEqual({ frozen: false, pending: [] })
  })

  it('删掉一条但还有剩余时保持冻结', () => {
    freezeStore.set('s1', { frozen: true, pending: [{ text: '甲', tier: 'queue' }, { text: '乙', tier: 'queue' }] })
    removePendingAt('s1', 0)
    const snap = freezeStore.getSnapshot('s1')
    expect(snap.frozen).toBe(true)
    expect(snap.pending.map((e) => e.text)).toEqual(['乙'])
  })

  it('越界删除不改变状态', () => {
    freezeStore.set('s1', { frozen: true, pending: [{ text: '甲', tier: 'queue' }] })
    removePendingAt('s1', 9)
    expect(freezeStore.getSnapshot('s1').pending.map((e) => e.text)).toEqual(['甲'])
  })
})

describe('其余 mutator 不得篡改显式冻结态', () => {
  it('updatePendingAt 保留 frozen=true', () => {
    freezeStore.set('s1', { frozen: true, pending: [{ text: '旧', tier: 'queue' }] })
    updatePendingAt('s1', 0, '新')
    const snap = freezeStore.getSnapshot('s1')
    expect(snap.frozen).toBe(true)
    expect(snap.pending[0].text).toBe('新')
  })

  it('setTierAt 保留 frozen=true 且只改档位', () => {
    freezeStore.set('s1', { frozen: true, pending: [{ text: '甲', tier: 'queue' }] })
    setTierAt('s1', 0, 'force')
    const snap = freezeStore.getSnapshot('s1')
    expect(snap.frozen).toBe(true)
    expect(snap.pending[0]).toEqual({ text: '甲', tier: 'force' })
  })

  it('movePending 保留 frozen=true 且按目标位置重排', () => {
    freezeStore.set('s1', {
      frozen: true,
      pending: [
        { text: '甲', tier: 'queue' },
        { text: '乙', tier: 'queue' },
        { text: '丙', tier: 'queue' },
      ],
    })
    movePending('s1', 0, 2)
    const snap = freezeStore.getSnapshot('s1')
    expect(snap.frozen).toBe(true)
    expect(snap.pending.map((e) => e.text)).toEqual(['乙', '丙', '甲'])
  })

  it('未冻结的会话上 pushPending 不会被顺手冻结', () => {
    // pushPending 是「冻结期入队」语义，但它只追加列表、不写 frozen 位：
    // 冻结与否永远由 freeze/resume 决定，mutator 不得越权。
    pushPending('s2', '正文', 'queue')
    const snap = freezeStore.getSnapshot('s2')
    expect(snap.pending).toHaveLength(1)
    expect(snap.frozen).toBe(false)
  })
})
