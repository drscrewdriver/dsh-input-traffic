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
import { freezeStore, resetFreezeStore } from '../src/client/freeze-store.ts'

function snapshot(queue: ConversationSnapshot['queue'], running = true): ConversationSnapshot {
  return { running, subagent: null, queue }
}

function mount(snap: ConversationSnapshot) {
  const updateQueue = vi.fn().mockResolvedValue(undefined)
  const cancel = vi.fn().mockResolvedValue(undefined)
  const send = vi.fn().mockResolvedValue(undefined)
  const sendSteer = vi.fn().mockResolvedValue(undefined)
  const notify = vi.fn()
  const setComposerBlock = vi.fn()
  const t = vi.fn((key: string) => key)
  const props = {
    session: snap,
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
  return { view, updateQueue, cancel, send, sendSteer, setComposerBlock, notify, t }
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
    expect(freezeStore.getSnapshot()).toEqual({
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
      freezeStore.set({ frozen: true, pending: [{ text: '急事', tier: 'force' }, { text: '排队', tier: 'queue' }] })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(cancel).toHaveBeenCalled()
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, '急事')
    expect(send).toHaveBeenNthCalledWith(2, '排队')
    expect(freezeStore.getSnapshot()).toEqual({ frozen: false, pending: [] })
  })

  it('freeze does not cancel the running turn (it finishes naturally)', async () => {
    const { cancel } = mount(snapshot([]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    expect(cancel).not.toHaveBeenCalled()
    expect(freezeStore.getSnapshot().frozen).toBe(true)
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
    expect(freezeStore.getSnapshot()).toEqual({ frozen: false, pending: [] })
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
    expect(freezeStore.getSnapshot().frozen).toBe(true)
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
    expect(freezeStore.getSnapshot()).toEqual({
      frozen: true,
      pending: [{ text: 'a', tier: 'queue' }, { text: '插话', tier: 'safe_point' }],
    })
  })

  it('resume re-steers safe_point (yellow) entries into the next step', async () => {
    const { cancel, send, sendSteer } = mount(snapshot([]))
    await act(async () => {
      freezeStore.set({ frozen: true, pending: [
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
    expect(freezeStore.getSnapshot()).toEqual({ frozen: false, pending: [] })
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
      freezeStore.set({ frozen: true, pending: [{ text: '排队', tier: 'queue' }] })
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

  it('fail-open (D8): session-guard 未装/不可达时冻结仍完成且不报错', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
    ]
    const { updateQueue, notify } = mount(snapshot(rows))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.freeze' }))
    })
    // 桥调用失败被静默吞掉：前端冻结照常完成，无任何错误提示。
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(freezeStore.getSnapshot().frozen).toBe(true)
    expect(notify).not.toHaveBeenCalled()
    // resume 同样 fail-open。
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.resume' }))
    })
    expect(freezeStore.getSnapshot().frozen).toBe(false)
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
})
