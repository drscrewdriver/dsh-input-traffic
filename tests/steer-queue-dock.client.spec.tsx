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
  beforeEach(() => {
    // Reset the persisted collapse state so tests start from a known layout.
    try {
      localStorage.clear()
    } catch {
      /* jsdom may not expose storage */
    }
  })

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
    // Two-step confirmation: arm, then confirm.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.clear' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.clear.confirm' }))
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

  it('shows the frozen banner while the detached queue stays interactive', () => {
    freezeStore.set({ frozen: true, pending: [{ text: 'keep me', tier: 'queue' }] })
    try {
      mount(snapshot([]))
      expect(screen.getByText('steer.frozen')).toBeTruthy()
      // The detached queue's tier planning stays interactive while frozen.
      const nowBtn = screen.getByRole('button', { name: 'steer.now' })
      expect(nowBtn.hasAttribute('disabled')).toBe(false)
      fireEvent.click(nowBtn)
      expect(freezeStore.getSnapshot().pending[0]?.tier).toBe('force')
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

/**
 * dsh-queue-plus-inspired queue-editing behaviors: drag-to-reorder,
 * reorder concurrency protection (reject instead of scrambling), collapse
 * state persistence, and a two-step clear confirmation.
 */
describe('queue editing (dsh-queue-plus inspired)', () => {
  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {
      /* jsdom may not expose storage */
    }
    resetFreezeStore()
  })

  it('frozen session keeps the waiting area visible with the detached queue editable', () => {
    freezeStore.set({ frozen: true, pending: [{ text: '排队一', tier: 'queue' }, { text: '排队二', tier: 'safe_point' }] })
    // After freeze the dsh queue is empty and the agent is idle, but the dock
    // must stay mounted and render the detached queue from the freeze store.
    const { view } = mount(snapshot([], { running: false }))
    expect(view.container.firstChild).not.toBeNull()
    const list = view.container.querySelector('[data-testid="frozen-list"]')
    expect(list).toBeTruthy()
    expect(list?.textContent).toContain('排队一')
    expect(list?.textContent).toContain('排队二')
    expect(list?.textContent).toContain('steer.frozenBadge')
    // Freezing pauses the run only: the detached queue stays fully editable,
    // including the planned insertion tier (red/yellow/green).
    expect(screen.getAllByRole('button', { name: 'steer.moveUp' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'queue.remove' }).length).toBe(2)
    expect(screen.getAllByRole('button', { name: 'queue.edit' }).length).toBe(2)
    expect(screen.getAllByRole('button', { name: 'steer.now' }).length).toBe(2)
    expect(screen.getAllByRole('button', { name: 'steer.next' }).length).toBe(2)
    expect(screen.getAllByRole('button', { name: 'steer.later' }).length).toBe(2)
  })

  it('frozen queue rows can be reordered and removed', () => {
    freezeStore.set({ frozen: true, pending: [{ text: '甲', tier: 'queue' }, { text: '乙', tier: 'queue' }, { text: '丙', tier: 'queue' }] })
    mount(snapshot([], { running: false }))
    // Move the last row (丙) up once: 甲, 丙, 乙.
    fireEvent.click(screen.getAllByRole('button', { name: 'steer.moveUp' })[2] as Element)
    expect(freezeStore.getSnapshot().pending.map(e => e.text)).toEqual(['甲', '丙', '乙'])
    // Remove 丙: 甲, 乙.
    fireEvent.click(screen.getAllByRole('button', { name: 'queue.remove' })[1] as Element)
    expect(freezeStore.getSnapshot().pending.map(e => e.text)).toEqual(['甲', '乙'])
  })

  it('frozen queue rows can be edited in place', () => {
    freezeStore.set({ frozen: true, pending: [{ text: '原文', tier: 'queue' }] })
    mount(snapshot([], { running: false }))
    fireEvent.click(screen.getByRole('button', { name: 'queue.edit' }))
    const editor = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(editor, { target: { value: '改后' } })
    fireEvent.click(screen.getByRole('button', { name: 'queue.save' }))
    expect(freezeStore.getSnapshot().pending).toEqual([{ text: '改后', tier: 'queue' }])
  })

  it('frozen queue rows can change the planned insertion tier (red/yellow/green)', () => {
    freezeStore.set({ frozen: true, pending: [{ text: '待规划', tier: 'queue' }] })
    mount(snapshot([], { running: false }))
    // Red: force interrupt on resume.
    fireEvent.click(screen.getByRole('button', { name: 'steer.now' }))
    expect(freezeStore.getSnapshot().pending[0]?.tier).toBe('force')
    // Yellow: safe_point.
    fireEvent.click(screen.getByRole('button', { name: 'steer.next' }))
    expect(freezeStore.getSnapshot().pending[0]?.tier).toBe('safe_point')
    // Green: queue (default).
    fireEvent.click(screen.getByRole('button', { name: 'steer.later' }))
    expect(freezeStore.getSnapshot().pending[0]?.tier).toBe('queue')
  })

  it('frozen queue rows support drag-to-reorder like the live queue', () => {
    freezeStore.set({ frozen: true, pending: [{ text: '甲', tier: 'queue' }, { text: '乙', tier: 'queue' }, { text: '丙', tier: 'queue' }] })
    const { view } = mount(snapshot([], { running: false }))
    const items = view.container.querySelectorAll('[data-testid="frozen-list"] li')
    expect(items).toHaveLength(3)
    const dataTransfer = { effectAllowed: '', setData: vi.fn(), getData: vi.fn() }
    // Drag the third row (丙) onto the first row (甲).
    fireEvent.dragStart(items[2] as Element, { dataTransfer })
    fireEvent.dragOver(items[0] as Element, { dataTransfer, preventDefault: vi.fn() })
    fireEvent.drop(items[0] as Element, { dataTransfer, preventDefault: vi.fn() })
    expect(freezeStore.getSnapshot().pending.map(e => e.text)).toEqual(['丙', '甲', '乙'])
  })

  it('clear requires a second confirm click before executing', async () => {
    const { updateQueue, cancel } = mount(snapshot([queueRow('m1', 'a')]))
    // First click arms the confirmation state; nothing is cancelled yet.
    fireEvent.click(screen.getByRole('button', { name: 'steer.clear' }))
    expect(cancel).not.toHaveBeenCalled()
    // The button now reads as a confirm prompt.
    expect(screen.getByRole('button', { name: 'steer.clear.confirm' })).toBeTruthy()
    // Second click executes the clear.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'steer.clear.confirm' }))
    })
    expect(cancel).toHaveBeenCalled()
    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
  })

  it('the armed clear can be aborted with the explicit cancel button', async () => {
    const { updateQueue, cancel } = mount(snapshot([queueRow('m1', 'a')]))
    fireEvent.click(screen.getByRole('button', { name: 'steer.clear' }))
    expect(screen.getByRole('button', { name: 'steer.clear.cancel' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'steer.clear.cancel' }))
    // Back to the idle prompt; nothing was cancelled or removed.
    expect(screen.queryByRole('button', { name: 'steer.clear.confirm' })).toBeNull()
    expect(cancel).not.toHaveBeenCalled()
    expect(updateQueue).not.toHaveBeenCalled()
  })

  it('drag-and-drop reorders the queue (remove all, resend in the new order)', async () => {
    const rows = [
      queueRow('m1', 'a'),
      queueRow('m2', 'b'),
      queueRow('m3', 'c'),
    ]
    const { view, updateQueue, send } = mount(snapshot(rows))
    // Expand the collapsed list.
    const header = view.container.querySelector('button[aria-controls]')
    expect(header).toBeTruthy()
    await act(async () => { fireEvent.click(header as Element) })

    const items = view.container.querySelectorAll('li')
    expect(items).toHaveLength(3)
    const dataTransfer = { effectAllowed: '', setData: vi.fn(), getData: vi.fn() }
    // Drag the third row (c) onto the first row (a).
    fireEvent.dragStart(items[2] as Element, { dataTransfer })
    fireEvent.dragOver(items[0] as Element, { dataTransfer, preventDefault: vi.fn() })
    fireEvent.drop(items[0] as Element, { dataTransfer, preventDefault: vi.fn() })
    await act(async () => { await Promise.resolve() })

    expect(updateQueue).toHaveBeenCalledWith('m1', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m2', { kind: 'remove' })
    expect(updateQueue).toHaveBeenCalledWith('m3', { kind: 'remove' })
    expect(send).toHaveBeenCalledTimes(3)
    expect(send).toHaveBeenNthCalledWith(1, 'c')
    expect(send).toHaveBeenNthCalledWith(2, 'a')
    expect(send).toHaveBeenNthCalledWith(3, 'b')
  })

  it('rejects the reorder when the queue changed mid-flight instead of scrambling', async () => {
    const { view, updateQueue, send, notify } = mount(snapshot([queueRow('m1', 'a'), queueRow('m2', 'b')]))
    // The agent claims the first row while the reorder removes it.
    updateQueue.mockRejectedValueOnce(new Error('queue-item-not-found'))
    // Expand the collapsed list so the row actions are visible.
    const header = view.container.querySelector('button[aria-controls]')
    expect(header).toBeTruthy()
    await act(async () => { fireEvent.click(header as Element) })
    // Use the move-down button to trigger a reorder.
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'steer.moveDown' })[0] as Element)
    })
    // The rebuild must stop: no re-send, and a stale-queue notice instead.
    expect(send).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith('error', 'steer.reorderStale')
  })

  it('remembers the manual collapse state across mounts', () => {
    // Persisted as expanded.
    try {
      localStorage.setItem('dsh-input-traffic:collapsed', '0')
    } catch {
      /* ignore */
    }
    const { view } = mount(snapshot([queueRow('m1', 'a'), queueRow('m2', 'b')]))
    // With persisted expanded state the list is visible without a click.
    expect(view.container.querySelector('ul[hidden]')).toBeNull()
    // Toggling the header persists the collapsed state.
    const header = view.container.querySelector('button[aria-controls]')
    expect(header).toBeTruthy()
    fireEvent.click(header as Element)
    expect(localStorage.getItem('dsh-input-traffic:collapsed')).toBe('1')
  })
})
