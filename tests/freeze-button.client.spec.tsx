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
  const notify = vi.fn()
  const t = vi.fn((key: string) => key)
  const props = {
    session: snap,
    updateQueue,
    cancel,
    send,
    notify,
    t,
  } as unknown as FreezeButtonProps
  const view = render(<FreezeButton {...props} />)
  return { view, updateQueue, cancel, send, notify, t }
}

beforeEach(() => {
  resetFreezeStore()
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
    expect(freezeStore.getSnapshot()).toEqual({ frozen: true, pending: ['a', 'b'] })
    // Toggle becomes resume.
    expect(screen.getByRole('button', { name: 'steer.resume' })).toBeTruthy()
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
})
