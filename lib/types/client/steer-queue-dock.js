import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Three-tier steering queue dock: the shadowing replacement for the official
 * `conversation.input.dock` entry (same cell id `queue`, priority -1, so the
 * lower priority wins and the official QueueDock never renders while this
 * plugin is mounted).
 *
 * Every queued row carries three planning buttons:
 * - green (later, the default state): the row already queues for the next
 *   turn —plain Enter keeps feeding rows here; pressing green on a row that
 *   was already steered (yellow) revokes the insertion and pulls it back to
 *   later (the yellow flow is reversible);
 * - yellow (next): strict-steer the row into the running turn, consumed at
 *   the next step boundary (after the current action finishes);
 * - red (now): cancel the running turn, then remove the row and re-send its
 *   text as a fresh message —the re-send arms the harness wake latch (the
 *   converged driver restarts) and the interrupted input is processed as the
 *   next turn's input. A plain steer after cancel would re-insert a message
 *   that is already pending in next-turn and the inbox rejects it.
 *
 * The toolbar also exposes a queue-level "cancel and clear" that stops the
 * current run and removes every queued row, plus a session-level
 * freeze/resume toggle for the peak-hour scenario: freeze stops the current
 * run while preserving the queue (keepInbox), resume re-arms the driver by
 * re-sending the first queued row so the preserved work continues.
 */
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { IconCheckOutline16, IconChevronDownOutline14, IconChevronUpOutline14, IconCloseOutline16, IconEditOutline16, IconQueueOutline14, IconRightUpOutline16, IconTrashOutline16, Tooltip, } from '@deepseek-ai/dsh-client-ui-primitives';
import { freezeStore, setTierAt, updatePendingAt, removePendingAt, movePending } from "./freeze-store.js";
import css from './steer-queue-dock.module.css';
/** Busy marker for a whole-queue rebuild (reorder); locks every row action. */
const REORDER_MARK = '__reorder__';
/** localStorage key for the manual collapse state (dsh-queue-plus parity). */
const COLLAPSE_KEY = 'dsh-input-traffic:collapsed';
/**
 * Resolve the action sequence for one planning button press. Pure so the
 * button wiring and its tests share one truth.
 * @param tier - the pressed planning tier.
 * @returns the queue mutation (red re-uses a steer-shaped action for the
 * yellow branch; the red branch performs cancel + remove + resend instead).
 */
export function planActionFor(tier) {
    if (tier === 'later')
        return { action: { kind: 'steer' }, interruptFirst: false };
    // Yellow steers only; red cancels the running turn first, then steers.
    return { action: { kind: 'steer' }, interruptFirst: tier === 'now' };
}
/**
 * Project the tier badge of one inbox row from its placement. Pure so the
 * row rendering and its tests share one truth.
 * @param placement - the inbox projection placement.
 * @returns the tier badge, or null for non-visible context rows.
 */
export function badgeFor(placement) {
    if (placement === 'steering')
        return 'next';
    if (placement === 'queued')
        return 'later';
    return null;
}
/**
 * Auto-grow one edit textarea to its content. The CSS max-height caps the
 * growth; beyond it the textarea scrolls internally. Height is reset first so
 * shrink (deleting lines) also tracks the content.
 * @param el - the textarea to resize in place.
 */
export function resizeEditor(el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
}
/**
 * Queue strip with three-tier planning: one item renders directly; multiple
 * items default to a collapsible count header; an empty queue renders nothing.
 */
export function SteerQueueDock({ sessionId, useSession, input, updateQueue, cancel, send, setDraft, notify, t }) {
    const inbox = useSession(s => s.queue);
    const queue = useMemo(() => inbox.filter(row => row.placement === 'queued'), [inbox]);
    const steering = useMemo(() => inbox.filter(row => row.placement === 'steering'), [inbox]);
    const running = useSession(s => s.running);
    const queueMutable = useSession(s => s.subagent === null);
    const [editing, setEditing] = useState(null);
    const [busy, setBusy] = useState(null);
    const [clearing, setClearing] = useState(false);
    // Two-step clear confirmation: the first click arms the prompt, the second
    // executes; arming auto-reverts after a few seconds (no native confirm).
    const [confirmClear, setConfirmClear] = useState(false);
    const confirmTimer = useRef(null);
    // Drag-and-drop reorder source index and the current drop-target row.
    const dragIndex = useRef(null);
    const [dragOver, setDragOver] = useState(null);
    // Collapse state persists across mounts (dsh-queue-plus parity).
    const [collapsed, setCollapsed] = useState(() => {
        try {
            const v = localStorage.getItem(COLLAPSE_KEY);
            return v === null ? true : v === '1';
        }
        catch {
            return true;
        }
    });
    // Session-level freeze lives in the composer-right control; the dock reads
    // the shared store for the banner and inert states. While frozen the
    // detached queue is rendered here (read-only) so the waiting area stays
    // visible — freezing only pauses the running behavior, it must not hide
    // the queued messages.
    const { frozen, pending: frozenPending } = useSyncExternalStore(freezeStore.subscribe, () => freezeStore.getSnapshot(sessionId ?? ''));
    const sid = sessionId ?? '';
    const listId = useId();
    // The edit textarea; grown to its content on entry and on every input.
    const editorRef = useRef(null);
    useEffect(() => {
        if (queue.length === 0 && !collapsed)
            setCollapsed(true);
        // Frozen-row edits use a `frozen:` id that never exists in the dsh queue;
        // skip the stale-check for them so the detached queue stays editable.
        if (editing !== null && !editing.id.startsWith('frozen:') && (!queueMutable || !queue.some(row => row.id === editing.id)))
            setEditing(null);
    }, [collapsed, editing, queue, queueMutable]);
    // Persist the manual collapse state; clear the confirm timer on unmount.
    useEffect(() => {
        try {
            localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
        }
        catch {
            /* storage unavailable: in-memory only */
        }
    }, [collapsed]);
    useEffect(() => () => {
        if (confirmTimer.current !== null)
            clearTimeout(confirmTimer.current);
    }, []);
    // Grow the editor to its full content when a row enters edit mode.
    const editingId = editing?.id;
    useEffect(() => {
        if (editingId === undefined)
            return;
        const el = editorRef.current;
        if (el !== null)
            resizeEditor(el);
    }, [editingId]);
    // The dock stays mounted while the agent runs (the freeze entry must be
    // reachable before any message queues), while any row is pending, and while
    // the session is frozen (the detached queue stays visible).
    if (queue.length === 0 && steering.length === 0 && !running && !frozen)
        return null;
    const interactionActive = queueMutable && (editing !== null || busy !== null || clearing);
    const expanded = !collapsed || interactionActive;
    const listVisible = queue.length === 1 || expanded;
    const planDisabled = !queueMutable || !running || frozen;
    const nothingPending = queue.length === 0 && steering.length === 0;
    // Reordering rebuilds the queue by re-sending texts; non-text rows cannot
    // be re-sent, so sorting is disabled while any such row is queued.
    const reorderUnsupported = queue.some(row => row.text === null);
    // Pull-back-to-composer is only offered when the composer draft is empty:
    // the pulled message back-fills the draft, so an occupied composer would be
    // overwritten. Steered (yellow/red) rows never offer it — once inserted,
    // they are not deeply re-edited.
    const composerEmpty = input.draft.trim() === '';
    const applyAction = async (itemId, action, failure) => {
        setBusy(itemId);
        try {
            await updateQueue(itemId, action);
            return true;
        }
        catch {
            notify('error', failure);
            return false;
        }
        finally {
            setBusy(current => current === itemId ? null : current);
        }
    };
    const saveEdit = async () => {
        if (editing === null || editing.text.trim() === '')
            return;
        const itemId = editing.id;
        const text = editing.text;
        setBusy(itemId);
        try {
            await updateQueue(itemId, { kind: 'edit', content: [{ type: 'text', text }] });
            setEditing(null);
        }
        catch {
            // The edit failed (the agent may have claimed the row mid-edit): fall
            // back to the composer so the edited content is never lost. Only when
            // the composer is free — an occupied draft must not be overwritten.
            if (input.draft.trim() === '') {
                setDraft(text);
                setEditing(null);
                notify('error', t('queue.editFailed.pulledBack'));
            }
            else {
                notify('error', t('queue.editFailed'));
            }
        }
        finally {
            setBusy(current => current === itemId ? null : current);
        }
    };
    const steerRow = async (row, tier) => {
        setBusy(row.id);
        try {
            if (tier === 'now') {
                // Interrupt, then re-submit: cancel stops the current run (keepInbox),
                // the row is removed so its identity cannot collide, and re-sending
                // the text arms the harness wake latch (the converged driver restarts
                // and processes it as the next turn's input). A plain steer after
                // cancel would re-insert a message already pending in next-turn and
                // the inbox rejects the duplicate.
                await cancel();
                await updateQueue(row.id, { kind: 'remove' });
                if (row.text !== null)
                    await send(row.text);
            }
            else {
                await updateQueue(row.id, { kind: 'steer' });
            }
        }
        catch {
            notify('error', tier === 'now' ? t('steer.nowFailed') : t('steer.nextFailed'));
        }
        finally {
            setBusy(current => current === row.id ? null : current);
        }
    };
    /**
     * Revoke a steered (yellow) or interrupting (red) row back to later: remove
     * the admitted row and re-send its text as a queued follow-up, so it lands
     * in next-turn again (the yellow flow is reversible).
     */
    const revokeToLater = async (row) => {
        if (row.text === null)
            return;
        setBusy(row.id);
        try {
            await updateQueue(row.id, { kind: 'remove' });
            await send(row.text);
        }
        catch {
            notify('error', t('steer.revokeFailed'));
        }
        finally {
            setBusy(current => current === row.id ? null : current);
        }
    };
    /**
     * Rebuild the queue in a new order: remove every queued row, then re-send
     * the texts sequentially so the agent's next-turn list matches the new
     * order. Concurrency protection (dsh-queue-plus parity): if a remove fails
     * with queue-item-not-found, the agent already claimed that row — the
     * rebuild stops immediately and nothing is re-sent, so the changed queue
     * is never scrambled.
     */
    const rebuildQueue = async (rows, next) => {
        setBusy(REORDER_MARK);
        try {
            for (const row of rows) {
                try {
                    await updateQueue(row.id, { kind: 'remove' });
                }
                catch (error) {
                    if (error instanceof Error && error.message.includes('queue-item-not-found')) {
                        notify('error', t('steer.reorderStale'));
                        return;
                    }
                    throw error;
                }
            }
            for (const row of next) {
                if (row.text !== null)
                    await send(row.text);
            }
        }
        catch {
            notify('error', t('steer.reorderFailed'));
        }
        finally {
            setBusy(null);
        }
    };
    /**
     * Move one queued row up/down in the FIFO order (arrow buttons).
     */
    const reorder = async (rowId, delta) => {
        const rows = queue;
        const index = rows.findIndex(row => row.id === rowId);
        const target = index + delta;
        if (index < 0 || target < 0 || target >= rows.length)
            return;
        const next = [...rows];
        const swapped = next[index];
        next[index] = next[target];
        next[target] = swapped;
        if (next.some(row => row.text === null)) {
            notify('error', t('steer.reorder.unsupported'));
            return;
        }
        await rebuildQueue(rows, next);
    };
    /**
     * Move one row to an absolute position (drag-and-drop drop handler).
     */
    const reorderTo = async (fromIndex, toIndex) => {
        if (fromIndex === toIndex)
            return;
        const rows = queue;
        if (rows[fromIndex] === undefined || rows[toIndex] === undefined)
            return;
        const next = [...rows];
        const [moved] = next.splice(fromIndex, 1);
        if (moved === undefined)
            return;
        next.splice(toIndex, 0, moved);
        if (next.some(row => row.text === null)) {
            notify('error', t('steer.reorder.unsupported'));
            return;
        }
        await rebuildQueue(rows, next);
    };
    /** Arm or execute the two-step clear confirmation. */
    const armClear = () => {
        if (confirmClear) {
            if (confirmTimer.current !== null)
                clearTimeout(confirmTimer.current);
            setConfirmClear(false);
            void clearAll();
            return;
        }
        setConfirmClear(true);
        if (confirmTimer.current !== null)
            clearTimeout(confirmTimer.current);
        confirmTimer.current = setTimeout(() => setConfirmClear(false), 3000);
    };
    /** Abort the armed clear confirmation (the explicit cancel button). */
    const cancelClear = () => {
        if (confirmTimer.current !== null)
            clearTimeout(confirmTimer.current);
        setConfirmClear(false);
    };
    /** Save an in-place edit of one detached (frozen) queued message. */
    const saveFrozenEdit = async (index) => {
        if (editing === null)
            return;
        const text = editing.text.trim();
        if (text === '') {
            setEditing(null);
            return;
        }
        updatePendingAt(sid, index, text);
        setEditing(null);
    };
    /**
     * Pull one queued row back into the composer draft for editing: the text
     * back-fills the input box and the row leaves the queue; the user edits and
     * resubmits it as a fresh message.
     */
    const pullBackToComposer = async (row) => {
        if (row.text === null)
            return;
        setDraft(row.text);
        setBusy(row.id);
        try {
            await updateQueue(row.id, { kind: 'remove' });
        }
        catch {
            notify('error', t('steer.pullBackFailed'));
        }
        finally {
            setBusy(current => current === row.id ? null : current);
        }
    };
    const clearAll = async () => {
        setClearing(true);
        // Cancel the current run and clear every pending row (queued and
        // steering alike). Removal races the agent claiming rows;
        // item-not-found is a normal convergence and must not surface.
        const pending = [...queue, ...steering];
        try {
            await cancel();
            await Promise.all(pending.map(row => updateQueue(row.id, { kind: 'remove' }).catch(() => undefined)));
        }
        catch {
            notify('error', t('steer.clearFailed'));
        }
        finally {
            setClearing(false);
        }
    };
    return (_jsx("div", { className: css.dock, "data-steer-dock": "", children: _jsxs("div", { className: css.panel, children: [_jsxs("div", { className: css.toolbar, children: [_jsxs("button", { type: "button", className: css.header, "aria-controls": listId, "aria-expanded": expanded, disabled: queue.length <= 1 || interactionActive, onClick: () => { setCollapsed(value => !value); }, children: [_jsx("span", { className: css.lead, "aria-hidden": true, children: _jsx(IconQueueOutline14, {}) }), queue.length > 0 && (_jsx("span", { className: css.count, children: t('queue.count', { n: queue.length }) })), queue.length > 1 && (_jsx("span", { className: css.chevron, "aria-hidden": true, children: expanded ? _jsx(IconChevronDownOutline14, {}) : _jsx(IconChevronUpOutline14, {}) }))] }), _jsxs("div", { className: css.toolbarActions, children: [confirmClear && (_jsx("button", { type: "button", className: css.clearCancel, "aria-label": t('steer.clear.cancel'), disabled: clearing || busy !== null || nothingPending, onClick: cancelClear, children: _jsx("span", { className: css.clearLabel, children: t('steer.clear.cancel') }) })), _jsx(Tooltip, { label: confirmClear ? t('steer.clear.confirm') : t('steer.clear'), side: "top", delayMs: 500, children: _jsxs("button", { type: "button", className: `${css.clear} ${confirmClear ? css.clearConfirm : ''}`, "aria-label": confirmClear ? t('steer.clear.confirm') : t('steer.clear'), disabled: clearing || busy !== null || nothingPending, onClick: armClear, children: [_jsx(IconTrashOutline16, { size: 14 }), _jsx("span", { className: css.clearLabel, children: confirmClear ? t('steer.clear.confirm') : t('steer.clear') })] }) })] })] }), frozen && (_jsx("div", { className: css.frozenBanner, role: "status", children: t('steer.frozen') })), frozen && frozenPending.length > 0 && (_jsx("ul", { className: css.frozenList, "data-testid": "frozen-list", children: frozenPending.map((entry, i) => {
                        const editingFrozen = editing?.id === `frozen:${i}`;
                        const text = entry.text;
                        return (_jsxs("li", { className: `${css.frozenRow} ${dragOver === i && frozen ? css.rowDragOver : ''}`, "data-tier": entry.tier === 'force' ? 'now' : entry.tier === 'safe_point' ? 'next' : 'later', "data-editing": editingFrozen ? '' : undefined, draggable: !editingFrozen, title: !editingFrozen ? t('steer.dragReorder') : undefined, onDragStart: (event) => {
                                if (editingFrozen)
                                    return;
                                dragIndex.current = i;
                                event.dataTransfer.effectAllowed = 'move';
                                // Some engines only start HTML5 drag once data is set.
                                event.dataTransfer.setData('text/plain', String(i));
                            }, onDragOver: (event) => {
                                if (dragIndex.current === null)
                                    return;
                                event.preventDefault();
                                setDragOver(i);
                            }, onDrop: (event) => {
                                event.preventDefault();
                                const from = dragIndex.current;
                                dragIndex.current = null;
                                setDragOver(null);
                                if (from !== null)
                                    movePending(sid, from, i);
                            }, onDragEnd: () => {
                                dragIndex.current = null;
                                setDragOver(null);
                            }, children: [_jsx("span", { className: css.lead, "aria-hidden": true, children: _jsx(IconQueueOutline14, {}) }), _jsx(SteerBadge, { tier: entry.tier === 'force' ? 'now' : entry.tier === 'safe_point' ? 'next' : 'later', t: t }), editingFrozen
                                    ? (_jsx("textarea", { ref: editorRef, autoFocus: true, className: css.editor, "aria-label": t('queue.edit'), rows: 1, value: editing?.text ?? text, onChange: (event) => { setEditing({ id: `frozen:${i}`, text: event.currentTarget.value }); }, onInput: (event) => { resizeEditor(event.currentTarget); }, onKeyDown: (event) => {
                                            if (event.key === 'Escape') {
                                                setEditing(null);
                                                return;
                                            }
                                            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                                                event.preventDefault();
                                                void saveFrozenEdit(i);
                                            }
                                        } }))
                                    : _jsx("span", { className: css.preview, children: text }), _jsx("div", { className: css.actions, children: editingFrozen ? (_jsxs(_Fragment, { children: [_jsx(Tooltip, { label: t('queue.save'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.save'), disabled: editing === null || editing.text.trim() === '', onClick: () => { void saveFrozenEdit(i); }, children: _jsx(IconCheckOutline16, { size: 14 }) }) }), _jsx(Tooltip, { label: t('queue.cancelEdit'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.cancelEdit'), onClick: () => { setEditing(null); }, children: _jsx(IconCloseOutline16, { size: 14 }) }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Tooltip, { label: t('steer.moveUp'), side: "bottom", delayMs: 500, disabled: i === 0, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('steer.moveUp'), disabled: i === 0, onClick: () => movePending(sid, i, i - 1), children: _jsx(IconChevronUpOutline14, {}) }) }), _jsx(Tooltip, { label: t('steer.moveDown'), side: "bottom", delayMs: 500, disabled: i === frozenPending.length - 1, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('steer.moveDown'), disabled: i === frozenPending.length - 1, onClick: () => movePending(sid, i, i + 1), children: _jsx(IconChevronDownOutline14, {}) }) }), _jsx(Tooltip, { label: t('queue.edit'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.edit'), onClick: () => { setEditing({ id: `frozen:${i}`, text }); }, children: _jsx(IconEditOutline16, { size: 14 }) }) }), _jsx(Tooltip, { label: t('queue.remove'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.remove'), onClick: () => removePendingAt(sid, i), children: _jsx(IconTrashOutline16, { size: 14 }) }) }), _jsxs("span", { className: css.plan, role: "group", "aria-label": t('steer.later.aria'), children: [_jsx(Tooltip, { label: t('steer.now'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierNow}`, "aria-label": t('steer.now'), "aria-pressed": entry.tier === 'force' || undefined, onClick: () => setTierAt(sid, i, 'force'), children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) }), _jsx(Tooltip, { label: t('steer.next'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierNext}`, "aria-label": t('steer.next'), "aria-pressed": entry.tier === 'safe_point' || undefined, onClick: () => setTierAt(sid, i, 'safe_point'), children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) }), _jsx(Tooltip, { label: t('steer.later'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierLater}`, "aria-label": t('steer.later'), "aria-pressed": entry.tier === 'queue' || undefined, onClick: () => setTierAt(sid, i, 'queue'), children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) })] })] })) }), _jsx("span", { className: css.frozenMark, children: t('steer.frozenBadge') })] }, i));
                    }) })), _jsx("ul", { id: listId, className: css.list, hidden: !listVisible, children: listVisible && queue.map((row, index) => (_jsxs("li", { className: `${css.row} ${dragOver === index ? css.rowDragOver : ''}`, "data-tier": badgeFor('queued') ?? undefined, "data-editing": editing?.id === row.id ? '' : undefined, draggable: queueMutable && !reorderUnsupported && busy === null && !frozen, title: queueMutable && !reorderUnsupported && busy === null && !frozen ? t('steer.dragReorder') : undefined, onDragStart: (event) => {
                            dragIndex.current = index;
                            event.dataTransfer.effectAllowed = 'move';
                            // Some engines only start HTML5 drag once data is set.
                            event.dataTransfer.setData('text/plain', String(index));
                        }, onDragOver: (event) => {
                            if (dragIndex.current === null)
                                return;
                            event.preventDefault();
                            setDragOver(index);
                        }, onDrop: (event) => {
                            event.preventDefault();
                            const from = dragIndex.current;
                            dragIndex.current = null;
                            setDragOver(null);
                            if (from !== null)
                                void reorderTo(from, index);
                        }, onDragEnd: () => {
                            dragIndex.current = null;
                            setDragOver(null);
                        }, children: [queue.length === 1 && _jsx("span", { className: css.lead, "aria-hidden": true, children: _jsx(IconQueueOutline14, {}) }), _jsx(SteerBadge, { tier: badgeFor('queued'), t: t }), editing?.id === row.id
                                ? (_jsx("textarea", { ref: editorRef, autoFocus: true, className: css.editor, "aria-label": t('queue.edit'), rows: 1, value: editing.text, onChange: (event) => { setEditing({ id: row.id, text: event.currentTarget.value }); }, onInput: (event) => { resizeEditor(event.currentTarget); }, onKeyDown: (event) => {
                                        if (event.key === 'Escape') {
                                            setEditing(null);
                                            return;
                                        }
                                        // Plain Enter saves; Shift+Enter keeps editing (newline).
                                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                                            event.preventDefault();
                                            void saveEdit();
                                        }
                                    } }))
                                : _jsx("span", { className: css.preview, children: row.preview }), queueMutable && _jsx("div", { className: css.actions, children: editing?.id === row.id
                                    ? (_jsxs(_Fragment, { children: [_jsx(Tooltip, { label: t('queue.save'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.save'), disabled: busy !== null || editing.text.trim() === '', onClick: () => { void saveEdit(); }, children: _jsx(IconCheckOutline16, { size: 14 }) }) }), _jsx(Tooltip, { label: t('queue.cancelEdit'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.cancelEdit'), disabled: busy !== null, onClick: () => { setEditing(null); }, children: _jsx(IconCloseOutline16, { size: 14 }) }) })] }))
                                    : (_jsxs(_Fragment, { children: [_jsx(Tooltip, { label: t('steer.moveUp'), side: "bottom", delayMs: 500, disabled: frozen || reorderUnsupported, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('steer.moveUp'), title: reorderUnsupported ? t('steer.reorder.unsupported') : undefined, disabled: busy !== null || frozen || reorderUnsupported, onClick: () => { void reorder(row.id, -1); }, children: _jsx(IconChevronUpOutline14, {}) }) }), _jsx(Tooltip, { label: t('steer.moveDown'), side: "bottom", delayMs: 500, disabled: frozen || reorderUnsupported, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('steer.moveDown'), title: reorderUnsupported ? t('steer.reorder.unsupported') : undefined, disabled: busy !== null || frozen || reorderUnsupported, onClick: () => { void reorder(row.id, 1); }, children: _jsx(IconChevronDownOutline14, {}) }) }), _jsx(Tooltip, { label: t('steer.pullBack'), side: "bottom", delayMs: 500, disabled: row.text === null || !composerEmpty, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('steer.pullBack'), title: row.text === null ? t('steer.pullBack.unsupported') : !composerEmpty ? t('steer.pullBack.composerBusy') : undefined, disabled: busy !== null || frozen || row.text === null || !composerEmpty, onClick: () => { void pullBackToComposer(row); }, children: _jsx(IconRightUpOutline16, {}) }) }), _jsx(Tooltip, { label: t('queue.edit'), side: "bottom", delayMs: 500, disabled: row.text === null, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.edit'), title: row.text === null ? t('queue.edit.unsupported') : undefined, disabled: busy !== null || row.text === null, onClick: () => {
                                                        if (row.text !== null)
                                                            setEditing({ id: row.id, text: row.text });
                                                    }, children: _jsx(IconEditOutline16, { size: 14 }) }) }), _jsx(Tooltip, { label: t('queue.remove'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: css.action, "aria-label": t('queue.remove'), disabled: busy !== null, onClick: () => {
                                                        void applyAction(row.id, { kind: 'remove' }, t('queue.removeFailed'));
                                                    }, children: _jsx(IconTrashOutline16, { size: 14 }) }) }), _jsxs("span", { className: css.plan, role: "group", "aria-label": t('steer.later.aria'), children: [_jsx(Tooltip, { label: t('steer.now'), side: "bottom", delayMs: 500, disabled: planDisabled || row.text === null, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierNow}`, "aria-label": t('steer.now'), title: planDisabled ? t('steer.unavailable.running') : row.text === null ? t('steer.now.unsupported') : undefined, disabled: busy !== null || planDisabled || row.text === null, onClick: () => { void steerRow(row, 'now'); }, children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) }), _jsx(Tooltip, { label: t('steer.next'), side: "bottom", delayMs: 500, disabled: planDisabled, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierNext}`, "aria-label": t('steer.next'), title: planDisabled ? t('steer.unavailable.running') : undefined, disabled: busy !== null || planDisabled, onClick: () => { void steerRow(row, 'next'); }, children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) }), _jsx(Tooltip, { label: t('steer.later'), side: "bottom", delayMs: 500, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierLater}`, "aria-label": t('steer.later'), "aria-pressed": true, disabled: busy !== null || clearing, onClick: () => {
                                                                // Later is the default queue state; pressing it
                                                                // keeps the row queued (no-op by design).
                                                            }, children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) })] })] })) })] }, row.id))) }), steering.length > 0 && (_jsx("ul", { className: css.steeringList, "data-steering-list": "", children: steering.map(row => (_jsxs("li", { className: css.row, "data-tier": badgeFor('steering') ?? undefined, children: [_jsx("span", { className: css.lead, "aria-hidden": true, children: _jsx(IconQueueOutline14, {}) }), _jsx(SteerBadge, { tier: badgeFor('steering'), t: t }), _jsx("span", { className: css.preview, children: row.preview }), _jsx("div", { className: css.actions, children: _jsx(Tooltip, { label: t('steer.revoke'), side: "bottom", delayMs: 500, disabled: row.text === null, children: _jsx("button", { type: "button", className: `${css.tier} ${css.tierLater}`, "aria-label": t('steer.revoke'), title: row.text === null ? t('steer.revoke.unsupported') : undefined, disabled: busy !== null || row.text === null || frozen, onClick: () => { void revokeToLater(row); }, children: _jsx("span", { className: css.dot, "aria-hidden": true }) }) }) })] }, row.id))) }))] }) }));
}
/** Badge label keys per tier. */
const BADGE_KEYS = {
    now: 'steer.badge.now',
    next: 'steer.badge.next',
    later: 'steer.badge.later',
};
/** Badge tint classes per tier (present at bundle time; typed through the css-modules declaration). */
const BADGE_CLASSES = {
    now: css.badgeNow,
    next: css.badgeNext,
    later: css.badgeLater,
};
/** One row's tier badge: colored dot + label; context rows render nothing. */
function SteerBadge({ tier, t }) {
    if (tier === null)
        return null;
    return (_jsxs("span", { className: `${css.badge} ${BADGE_CLASSES[tier]}`, "data-badge": tier, children: [_jsx("span", { className: css.dot, "aria-hidden": true }), _jsx("span", { className: css.badgeLabel, children: t(BADGE_KEYS[tier]) })] }));
}
//# sourceMappingURL=steer-queue-dock.js.map