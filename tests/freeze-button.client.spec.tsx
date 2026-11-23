/**
 * Composer-right freeze/resume control tests: freeze detaches every queued
 * row into the shared store (the current turn finishes naturally), resume
 * re-submits the preserved texts in FIFO order.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import { FreezeButton } from '../src/client/freeze-button.tsx'
import type { FreezeButtonProps } from '../src/client/freeze-button.tsx'
import { freezeStore, resetFreezeStore, updatePendingAt } from '../src/client/freeze-store.ts'

function snapshot(queue: ConversationSnapshot['queue'], running = true): ConversationSnapshot {
  return { running, subagent: null, queue }
}

/**
 * Mount the control with the two-version props intersection: the session
 * standard kit always (`useSession` + `sessionId`), and — only when
 * `legacyOwner` is set — the 0.1.1 `InputZone` owner share that 0.1.2 no
 * longer delivers (`InputBar.tsx:466` renders the slot with `{}`).
 * @param snap - the session snapshot the standard kit selector answers with.
 * @param options - `legacyOwner` adds the 0.1.1-only `session` owner share.
 */
function mount(snap: ConversationSnapshot, options: { legacyOwner?: boolean } = {}) {
  const updateQueue = vi.fn().mockResolvedValue(undefined)
  const cancel = vi.fn().mockResolvedValue(undefined)
  const send = vi.fn().mockResolvedValue(undefined)
  const sendSteer = vi.fn().mockResolvedValue(undefined)
  const notify = vi.fn()
  const setComposerBlock = vi.fn()
  const t = vi.fn((key: string) => key)
  const props = {
    useProjection: (key: 'inbox') => key === 'inbox'
      ? {
          'next-turn': snap.queue.filter(row => row.placement === 'queued'),
          'next-step': snap.queue.filter(row => row.placement === 'steering'),
        }
      : undefined,
    ...(options.legacyOwner === true ? { session: snap } : {}),
    updateQueue,
    cancel,
    send,
    sendSteer,
    sessionId: 's1',
    setComposerBlock,
    notify,
    t,
  } as unknown as FreezeButtonProps
  const view = render(<FreezeButton {...props} />)
  return { view, updateQueue, cancel, send, sendSteer, setComposerBlock, notify, t, props }
}

beforeEach(() => {
  resetFreezeStore()
  // 默认让 sessionGuard 桥不可达（fail-open 路径）：jsdom 无 fetch 或路由 404。
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('FreezeButton', () => {
  it('freezes with the 0.1.2 props shape: no owner share, session data via useSession', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue, props } = mount(snapshot(rows))
    // 0.1.2 renders `conversation.input.right` with `{}` — the owner share
    // must not exist in props at all.
    expect('session' in (props as object)).toBe(false)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }],
    })
  })

  it('tolerates the 0.1.1 owner share when the harness still delivers it', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue } = mount(snapshot(rows), { legacyOwner: true })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(freezeStore.getSnapshot('s1').frozen).toBe(true)
  })

  it('freeze detaches every queued row and preserves its text', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
      { id: 'm2', messageId: 'm2', placement: 'queued' as const, preview: 'b', text: 'b', content: [] },
    ]
    const { updateQueue } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m2', { kind: 'remove' })
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }, { text: 'b', tier: 'queue' }],
    })
    // Toggle becomes resume.
    expect(screen.getByRole('button', { name: 'steer.resume' })).toBeTruthy()
  })

  it('resume re-submits the preserved queue honoring the planned tiers', async () => {
    const { cancel, send } = mount(snapshot([]))
    // First entry planned as force: resume must interrupt before sending it.
    await act(async () => {
      freezeStore.set('s1', { frozen: true, pending: [{ text: '急事', tier: 'force' }, { text: '排队', tier: 'queue' }] })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(cancel).toHaveBeenCalled()
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, '急事')
    expect(send).toHaveBeenNthCalledWith(2, '排队')
    expect(freezeStore.getSnapshot('s1')).toEqual({ frozen: false, pending: [] })
  })

  it('freeze does not cancel the running turn (it finishes naturally)', async () => {
    const { cancel } = mount(snapshot([]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(cancel).not.toHaveBeenCalled()
    expect(freezeStore.getSnapshot('s1').frozen).toBe(true)
  })

  it('resume re-submits the preserved texts in order', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
      { id: 'm2', messageId: 'm2', placement: 'queued' as const, preview: 'b', text: 'b', content: [] },
    ]
    const { send } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, 'a')
    expect(send).toHaveBeenNthCalledWith(2, 'b')
    expect(freezeStore.getSnapshot('s1')).toEqual({ frozen: false, pending: [] })
  })

  it('freeze tolerates rows already claimed by the agent', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue, notify } = mount(snapshot(rows))
    updateQueue.mockRejectedValueOnce(new Error('queue-item-not-found'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // The claimed row is dropped silently; the freeze still completes.
    expect(freezeStore.getSnapshot('s1').frozen).toBe(true)
    expect(notify).not.toHaveBeenCalled()
  })

  it('freeze detaches already-steered (next-step) rows as a safe_point plan', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
      { id: 's1', messageId: 's1', placement: 'steering' as const, preview: '插话', text: '插话', content: [] },
    ]
    const { updateQueue } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // The next-step row is detached too — nothing stays in the live queue
    // while frozen — and keeps its next intent as a safe_point tier.
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('s1', { kind: 'remove' })
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }, { text: '插话', tier: 'safe_point' }],
    })
  })

  it('freeze drops injected next-step notices (non-human source) instead of carrying them', async () => {
    // The host merges two things into next-step: human steering and context
    // pushed by a service (user-approval / policy / time-context, and third
    // party notes such as perm-gate's block opinion). Only the former is ours
    // to carry — a notice replayed through sendSteer() on resume would look
    // like the person typed a system prompt.
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
      {
        id: 's1', messageId: 's1', placement: 'steering' as const, preview: 'notice', text: 'notice', content: [],
        source: { kind: 'perm-gate' },
      },
    ]
    const { updateQueue } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // Only the human row lands in the detached queue.
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }],
    })
    // The notice is left alone — never claimed, never re-sent.
    expect(updateQueue).not.toHaveBeenCalledWith('s1', { kind: 'remove' })
  })

  it('freeze keeps a human steer (source.kind = user) as a safe_point plan', async () => {
    const rows = [
      {
        id: 's2', messageId: 's2', placement: 'steering' as const, preview: '插话', text: '插话', content: [],
        source: { kind: 'user' },
      },
    ]
    mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: '插话', tier: 'safe_point' }],
    })
  })

  it('resume re-steers safe_point (yellow) entries into the next step', async () => {    const { cancel, send, sendSteer } = mount(snapshot([]))
    await act(async () => {
      freezeStore.set('s1', { frozen: true, pending: [
        { text: '急事', tier: 'force' },
        { text: '插话', tier: 'safe_point' },
        { text: '排队', tier: 'queue' },
      ] })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(cancel).toHaveBeenCalled()
    // The yellow entry is steered (next-step), not re-queued as later.
    expect(sendSteer).toHaveBeenCalledWith('插话')
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, '急事')
    expect(send).toHaveBeenNthCalledWith(2, '排队')
    expect(freezeStore.getSnapshot('s1')).toEqual({ frozen: false, pending: [] })
  })

  it('freeze raises the composer block so Enter cannot leak into the conversation', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { setComposerBlock } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // Frozen: the composer is inert (blocked), so plain Enter is swallowed by
    // the bar instead of sending/queueing into the conversation.
    expect(setComposerBlock).toHaveBeenCalledWith(expect.any(String))
  })

  it('resume clears the composer block and awaits session-guard resume BEFORE re-submitting', async () => {
    const calls: string[] = []
    const fetchMock = vi.fn().mockImplementation(async (_url: unknown, init?: { body?: string }) => {
      calls.push(`fetch:${String(init?.body ?? '').includes('resume') ? 'resume' : 'other'}`)
      return { ok: true, json: async () => ({ ok: true }) }
    })
    vi.stubGlobal('fetch', fetchMock)
    const { send, setComposerBlock } = mount(snapshot([]))
    send.mockImplementation(async () => { calls.push('send') })
    await act(async () => {
      freezeStore.set('s1', { frozen: true, pending: [{ text: '排队', tier: 'queue' }] })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    // 恢复先续跑（session-guard resume RPC），再重投 —— later 级条目排在
    // 自然 next turn 之后，不会在 idle 态立即唤醒新回合抢跑。
    expect(calls[0]).toBe('fetch:resume')
    expect(calls.indexOf('send')).toBeGreaterThan(calls.indexOf('fetch:resume'))
    expect(setComposerBlock).toHaveBeenCalledWith(undefined)
  })

  it('fail-open (D8): session-guard 未装/不可达时冻结仍完成且不报错', async () => {    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue, notify } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // 桥调用失败被静默吞掉：前端冻结照常完成，无任何错误提示。
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(freezeStore.getSnapshot('s1').frozen).toBe(true)
    expect(notify).not.toHaveBeenCalled()
    // resume 同样 fail-open。
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(freezeStore.getSnapshot('s1').frozen).toBe(false)
    expect(notify).not.toHaveBeenCalled()
  })

  it('bridge 可达时冻结/解冻会调 sessionGuard RPC', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetchMock)
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // 冻结调 stopNextTurn
    const stopCall = fetchMock.mock.calls.find(c => String(c[1].body).includes('stopNextTurn'))
    expect(stopCall).toBeTruthy()
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    const resumeCall = fetchMock.mock.calls.find(c => String(c[1].body).includes('resume'))
    expect(resumeCall).toBeTruthy()
  })

  it('freezing one session does not freeze another (session-scoped store)', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // Session s1 is frozen with its detached queue…
    expect(freezeStore.getSnapshot('s1')).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }],
    })
    // …but session s2 is untouched — no cross-session leak.
    expect(freezeStore.getSnapshot('s2')).toEqual({ frozen: false, pending: [] })
    // Editing s1's detached queue leaves s2's snapshot reference-stable.
    updatePendingAt('s1', 0, '改后')
    expect(freezeStore.getSnapshot('s1').pending[0]?.text).toBe('改后')
    expect(freezeStore.getSnapshot('s2').pending).toEqual([])
  })
})

describe('issue #5：冻结态必须在摘队列之前就翻转', () => {
  it('updateQueue 未 resolve 时按钮已显示「恢复」、store 已 frozen', async () => {
    // 摘队列是逐行远程往返；旧实现把 store 写入放在 await 之后，整段摘除期间
    // 按钮文案与徽标都不变 —— 用户以为没生效再点一次，这是「盲点两下」的一半。
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: '甲', text: '甲', content: [] },
      { id: 'm2', messageId: 'm2', placement: 'queued' as const, preview: '乙', text: '乙', content: [] },
    ]
    const { view, updateQueue } = mount(snapshot(rows))
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => { release = resolve })
    updateQueue.mockImplementation(() => gate)

    await act(async () => {
      fireEvent.click(view.container.querySelector('button') as HTMLButtonElement)
      // 只等一拍：摘队列仍挂起中。
      await Promise.resolve()
    })

    expect(freezeStore.getSnapshot('s1').frozen).toBe(true)
    expect(freezeStore.getSnapshot('s1').pending.map((e) => e.text)).toEqual(['甲', '乙'])
    expect(view.container.querySelector('button')?.textContent).toContain('steer.resume')

    await act(async () => {
      release?.()
      await gate
    })
  })
})
