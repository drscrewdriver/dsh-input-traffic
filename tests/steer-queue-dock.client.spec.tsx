/**
 * Component tests for the three-tier steering queue dock: tier-button wiring
 * (yellow steers, red steers then cancels), the queue-level clear, failure
 * surfacing, disabled states, and the empty/collapse shapes.
 */
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import { SteerQueueDock, planActionFor, badgeFor, resizeEditor } from '../src/client/steer-queue-dock.tsx'
import type { SteerQueueDockInjected, SteerQueueDockProps } from '../src/client/steer-queue-dock.tsx'
import { freezeStore, resetFreezeStore } from '../src/client/freeze-store.ts'

function queueRow(id: string, preview: string) {
  return { id, messageId: id, placement: 'queued' as const, preview, text: preview, content: [] }
}

function snapshot(queue: ConversationSnapshot['queue'], overrides: Partial<ConversationSnapshot> = {}): ConversationSnapshot {
  return { running: true, subagent: null, queue, ...overrides }
}

function mount(snap: ConversationSnapshot, draft = '') {
  const updateQueue = vi.fn().mockResolvedValue(undefined)
  const cancel = vi.fn().mockResolvedValue(undefined)
  const send = vi.fn().mockResolvedValue(undefined)
  const setDraft = vi.fn()
  const notify = vi.fn()
  // Minimal interpolating stub: only queue.count carries a parameter today.
  const t = vi.fn((key: string, params?: Record<string, unknown>) => {
    if (key === 'queue.count' && params && typeof params.n === 'number') return String(params.n)
    return key
  })
  const props = {
    useSession: <T,>(selector: (s: ConversationSnapshot) => T): T => selector(snap),
    input: { draft, phase: 'plain' as const, queue: snap.queue },
    updateQueue,
    cancel,
    send,
    setDraft,
    notify,
    t,
  } as unknown as SteerQueueDockProps
  const view = render(<SteerQueueDock {...props} />)
  return { view, updateQueue, cancel, send, setDraft, notify, t, props }
}

describe('planActionFor', () => {
  it('maps now to interrupt-first plus steer, next to steer only', () => {
    expect(planActionFor('now')).toEqual({ action: { kind: 'steer' }, interruptFirst: true })
    expect(planActionFor('next')).toEqual({ action: { kind: 'steer' }, interruptFirst: false })
    expect(planActionFor('later')).toEqual({ action: { kind: 'steer' }, interruptFirst: false })
  })
})

describe('badgeFor', () => {
  it('projects the tier badge from placement', () => {
    expect(badgeFor('queued')).toBe('later')
    expect(badgeFor('steering')).toBe('next')
    expect(badgeFor('context')).toBeNull()
  })
})

describe('resizeEditor', () => {
  it('grows the textarea to its scroll height after resetting it', () => {
    const el = document.createElement('textarea')
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 88 })
    el.style.height = '20px'
    resizeEditor(el)
    expect(el.style.height).toBe('88px')
  })
})

describe('SteerQueueDock', () => {
  it('renders nothing for an empty queue while idle', () => {
    const { view } = mount(snapshot([], { running: false }))
    expect(view.container.firstChild).toBeNull()
  })

  it('stays mounted while running (banner seat and freeze feedback)', () => {
    const { view } = mount(snapshot([], { running: true }))
    expect(view.container.firstChild).not.toBeNull()
  })

  it('renders the queued row with three planning buttons and a later badge', () => {
    mount(snapshot([queueRow('m1', 'first message')]))
    expect(screen.getByText('first message')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'steer.now' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'steer.next' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'steer.later' })).toBeTruthy()
    const row = screen.getByText('first message').closest('li')
    expect(row?.getAttribute('data-tier')).toBe('later')
    expect(row?.querySelector('[data-badge]')?.getAttribute('data-badge')).toBe('later')
  })

  it('renders steering rows read-only with a next badge and a revoke button', () => {
    const steeringRow = { id: 's1', messageId: 's1', placement: 'steering' as const, preview: 'steering now', text: 'steering now', content: [] }
    mount(snapshot([steeringRow]))
    const row = screen.getByText('steering now').closest('li')
    expect(row?.getAttribute('data-tier')).toBe('next')
    // Steering rows carry no now/next planning buttons; the green revoke
    // (pull back to later) and the clear action stay.
    expect(screen.queryByRole('button', { name: 'steer.now' })).toBeNull()
    expect(screen.getByRole('button', { name: 'steer.revoke' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'steer.clear' })).toBeTruthy()
  })

  it('green on a steering row revokes it back to later (remove + resend)', async () => {
    const steeringRow = { id: 's1', messageId: 's1', placement: 'steering' as const, preview: 'steering now', text: 'steering now', content: [] }
    const { updateQueue, send } = mount(snapshot([steeringRow]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.revoke' }))
    })
    expect(updateQueue).toHaveBeenCalledWith('s1', { kind: 'remove' })
    expect(send).toHaveBeenCalledWith('steering now')
  })

  it('red interrupts the turn, removes the row and re-sends it as fresh input', async () => {
    const { updateQueue, cancel, send } = mount(snapshot([queueRow('m1', 'stop now')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.now' }))
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(cancel).toHaveBeenCalled()
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(send).toHaveBeenCalledWith('stop now')
    // Interrupt-first ordering: cancel before remove, remove before resend.
    const cancelCall = cancel.mock.invocationCallOrder[0] ?? -1
    const removeCall = updateQueue.mock.invocationCallOrder[0] ?? -1
    const sendCall = send.mock.invocationCallOrder[0] ?? -1
    expect(cancelCall).toBeLessThan(removeCall)
    expect(removeCall).toBeLessThan(sendCall)
  })

  it('move up rebuilds the queue in the new order (remove all, resend ordered)', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: 'a', text: 'a', content: [] },
      { id: 'm2', messageId: 'm2', placement: 'queued' as const, preview: 'b', text: 'b', content: [] },
      { id: 'm3', messageId: 'm3', placement: 'queued' as const, preview: 'c', text: 'c', content: [] },
    ]
    const { view, updateQueue, send } = mount(snapshot(rows))
    // Expand the collapsed list first (multiple rows default to a header).
    const header = view.container.querySelector('button[aria-controls]')
    expect(header).toBeTruthy()
    await act(async () => {
      fireEvent.click(header as Element)
    })
    // Move the last row (c) up once: a, c, b.
    const row = screen.getByText('c').closest('li')
    const moveUp = row?.querySelector('[aria-label="steer.moveUp"]')
    expect(moveUp).toBeTruthy()
    await act(async () => {
      fireEvent.click(moveUp as Element)
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m2', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m3', { kind: 'remove' })
    expect(send).toHaveBeenCalledTimes(3)
    expect(send).toHaveBeenNthCalledWith(1, 'a')
    expect(send).toHaveBeenNthCalledWith(2, 'c')
    expect(send).toHaveBeenNthCalledWith(3, 'b')
  })

  it('disables reorder while any queued row contains non-text content', async () => {
    const rows = [
      { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: '[image]', text: null, content: [] },
      { id: 'm2', messageId: 'm2', placement: 'queued' as const, preview: 'b', text: 'b', content: [] },
    ]
    const { view } = mount(snapshot(rows))
    const header = view.container.querySelector('button[aria-controls]')
    await act(async () => {
      fireEvent.click(header as Element)
    })
    const moveUp = screen.getAllByRole('button', { name: 'steer.moveUp' })
    const moveDown = screen.getAllByRole('button', { name: 'steer.moveDown' })
    expect(moveUp[0]?.hasAttribute('disabled')).toBe(true)
    expect(moveDown[0]?.hasAttribute('disabled')).toBe(true)
  })

  it('edits a queued row in a multi-line textarea and saves on Enter', async () => {
    const { updateQueue } = mount(snapshot([queueRow('m1', 'original')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    })
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(editor.tagName).toBe('TEXTAREA')
    await act(async () => {
      fireEvent.change(editor, { target: { value: 'line one\nline two\nline three' } })
    })
    expect(editor.value).toBe('line one\nline two\nline three')
    await act(async () => {
      fireEvent.keyDown(editor, { key: 'Enter' })
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', {
      kind: 'edit',
      content: [{ type: 'text', text: 'line one\nline two\nline three' }],
    })
  })

  it('keeps editing on Shift+Enter (newline) instead of saving', async () => {
    const { updateQueue } = mount(snapshot([queueRow('m1', 'original')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    })
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    await act(async () => {
      fireEvent.keyDown(editor, { key: 'Enter', shiftKey: true })
    })
    expect(updateQueue).not.toHaveBeenCalled()
  })

  it('auto-grows the editor with its content while editing', async () => {
    mount(snapshot([queueRow('m1', 'original')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    })
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    Object.defineProperty(editor, 'scrollHeight', { configurable: true, value: 96 })
    await act(async () => {
      fireEvent.input(editor, { target: { value: 'a\nb\nc\nd' } })
    })
    expect(editor.style.height).toBe('96px')
  })

  it('falls back to the composer when the edit save fails', async () => {
    const { updateQueue, setDraft, notify } = mount(snapshot([queueRow('m1', 'original')]))
    updateQueue.mockRejectedValueOnce(new Error('queue-item-not-found'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    })
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    await act(async () => {
      fireEvent.change(editor, { target: { value: 'edited content' } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.save' }))
    })
    expect(setDraft).toHaveBeenCalledWith('edited content')
    expect(notify).toHaveBeenCalledWith('error', 'queue.editFailed.pulledBack')
  })

  it('never overwrites an occupied composer when the edit save fails', async () => {
    const { updateQueue, setDraft, notify } = mount(snapshot([queueRow('m1', 'original')]), 'busy draft')
    updateQueue.mockRejectedValueOnce(new Error('queue-item-not-found'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    })
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    await act(async () => {
      fireEvent.change(editor, { target: { value: 'edited content' } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'queue.save' }))
    })
    expect(setDraft).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith('error', 'queue.editFailed')
  })

  it('pull back fills the composer draft and removes the row', async () => {
    const { updateQueue, setDraft } = mount(snapshot([queueRow('m1', 'edit me')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.pullBack' }))
    })
    expect(setDraft).toHaveBeenCalledWith('edit me')
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
  })

  it('disables pull back while the composer draft is occupied', () => {
    mount(snapshot([queueRow('m1', 'edit me')]), 'already typing...')
    const button = screen.getByRole('button', { name: 'steer.pullBack' })
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(button.getAttribute('title')).toBe('steer.pullBack.composerBusy')
  })

  it('disables pull back for non-text rows', () => {
    const imageRow = { id: 'm1', messageId: 'm1', placement: 'queued' as const, preview: '[image]', text: null, content: [] }
    mount(snapshot([imageRow]))
    expect(screen.getByRole('button', { name: 'steer.pullBack' }).hasAttribute('disabled')).toBe(true)
  })

  it('yellow steers the row without cancelling the turn', async () => {
    const { updateQueue, cancel } = mount(snapshot([queueRow('m1', 'go on')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.next' }))
    })
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'steer' })
    expect(cancel).not.toHaveBeenCalled()
  })

  it('disables the now/next tiers while the session is not running', () => {
    mount(snapshot([queueRow('m1', 'parked')], { running: false }))
    expect(screen.getByRole('button', { name: 'steer.now' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'steer.next' }).hasAttribute('disabled')).toBe(true)
    // Later stays enabled: it is the current default state, not an action.
    expect(screen.getByRole('button', { name: 'steer.later' }).hasAttribute('disabled')).toBe(false)
  })

  it('surfaces a genuine steer failure through notify', async () => {
    const { updateQueue, notify } = mount(snapshot([queueRow('m1', 'boom')]))
    updateQueue.mockRejectedValueOnce(new Error('boom'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.next' }))
    })
    expect(notify).toHaveBeenCalledWith('error', 'steer.nextFailed')
  })

  it('cancel and clear removes every queued row after cancelling', async () => {
    const { updateQueue, cancel } = mount(snapshot([queueRow('m1', 'a'), queueRow('m2', 'b')]))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.clear' }))
    })
    expect(cancel).toHaveBeenCalled()
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m2', { kind: 'remove' })
    expect(updateQueue.mock.calls.length).toBe(2)
  })

  it('clear tolerates rows already claimed by the agent', async () => {
    const { updateQueue, notify } = mount(snapshot([queueRow('m1', 'gone')]))
    updateQueue.mockRejectedValueOnce(new Error('queue-item-not-found'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.clear' }))
    })
    expect(notify).not.toHaveBeenCalled()
  })

  it('shows the frozen banner and disables planning while frozen', () => {
    freezeStore.set({ frozen: true, pending: ['keep me'] })
    try {
      mount(snapshot([queueRow('m1', 'keep me')]))
      expect(screen.getByText('steer.frozen')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'steer.now' }).hasAttribute('disabled')).toBe(true)
      expect(screen.getByRole('button', { name: 'steer.next' }).hasAttribute('disabled')).toBe(true)
    } finally {
      resetFreezeStore()
    }
  })

  it('collapses multiple rows behind the count header by default', () => {
    const { view } = mount(snapshot([queueRow('m1', 'a'), queueRow('m2', 'b')]))
    // The count header shows the queue length and the list starts collapsed.
    expect(screen.getByText('2')).toBeTruthy()
    const list = view.container.querySelector('ul[hidden]')
    expect(list).toBeTruthy()
  })
})

/** Smoke: the injected conversation face accepts the dock's actions. */
describe('SteerQueueDockInjected shape', () => {
  it('exposes the five verbs the dock calls', () => {
    const face: SteerQueueDockInjected = {
      updateQueue: async () => undefined,
      cancel: async () => undefined,
      send: async () => undefined,
      setDraft: () => undefined,
      notify: () => undefined,
    }
    expect(typeof face.updateQueue).toBe('function')
    expect(typeof face.cancel).toBe('function')
    expect(typeof face.send).toBe('function')
    expect(typeof face.setDraft).toBe('function')
    expect(typeof face.notify).toBe('function')
  })
})
