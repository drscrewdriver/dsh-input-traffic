window.__ModuleLoader__.load({
	id: "dsh-input-traffic",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** `steer` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "steer";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"queue.count": "{n} 条排队消息",
			"queue.edit": "编辑排队消息",
			"queue.edit.unsupported": "包含非文本内容，暂不支持编辑",
			"queue.save": "保存排队消息",
			"queue.cancelEdit": "取消编辑",
			"queue.remove": "删除排队消息",
			"queue.removeFailed": "删除失败：这条消息可能已经开始发送。",
			"queue.editFailed": "编辑失败：这条消息可能已经开始发送。",
			"queue.editFailed.pulledBack": "编辑失败，内容已退回主输入框，请确认后重新发送。",
			"steer.inflight": "{n} 条正在插入",
			"steer.now": "打断并输入",
			"steer.now.aria": "红色：打断当前动作并立即输入",
			"steer.now.unsupported": "包含非文本内容，暂不支持打断",
			"steer.nowFailed": "打断失败，请重试。",
			"steer.next": "插话发送",
			"steer.next.aria": "黄色：当前动作结束后插入输入",
			"steer.nextFailed": "插话发送失败，请重试。",
			"steer.later": "排队到下一轮",
			"steer.later.aria": "绿色：排队，上一轮输入的动作都结束后再处理",
			"steer.revoke": "收回排队",
			"steer.revoke.aria": "绿色：撤销插入，收回排队（下一轮处理）",
			"steer.revoke.unsupported": "包含非文本内容，暂不支持收回",
			"steer.revokeFailed": "收回排队失败，请重试。",
			"steer.moveUp": "上移",
			"steer.moveDown": "下移",
			"steer.reorder.unsupported": "包含非文本内容，暂不支持排序",
			"steer.reorderFailed": "调整顺序失败，请重试。",
			"steer.reorderStale": "队列已变化，本次排序已取消，请重试。",
			"steer.dragReorder": "拖动调整顺序",
			"steer.pullBack": "打回输入框编辑",
			"steer.pullBack.unsupported": "包含非文本内容，暂不支持打回编辑",
			"steer.pullBack.composerBusy": "主输入框已有内容，请先发送或清空后再打回",
			"steer.pullBackFailed": "打回输入框失败，请重试。",
			"steer.badge.now": "打断中",
			"steer.badge.next": "插话中",
			"steer.badge.later": "排队",
			"steer.unavailable.running": "仅运行中可规划",
			"steer.clear": "取消并清空",
			"steer.clear.confirm": "确认清空？",
			"steer.clear.cancel": "取消清空",
			"steer.clear.aria": "取消当前执行并清空全部排队消息",
			"steer.clearFailed": "取消并清空失败，请重试。",
			"steer.freeze": "冻结会话",
			"steer.resume": "恢复会话",
			"steer.frozen": "已冻结：当前轮次完成后暂停，排队消息将在恢复后继续",
			"steer.frozenInput": "已冻结：输入已暂停，恢复后继续",
			"steer.frozenBadge": "已冻结",
			"steer.freezeFailed": "冻结失败，请重试。",
			"steer.resumeFailed": "恢复失败，请重试。"
		};
		/** English dictionary (keys mirror zh). */
		const en = {
			"queue.count": "{n} queued messages",
			"queue.edit": "Edit queued message",
			"queue.edit.unsupported": "Contains non-text content; editing is unsupported",
			"queue.save": "Save queued message",
			"queue.cancelEdit": "Cancel edit",
			"queue.remove": "Remove queued message",
			"queue.removeFailed": "Remove failed: the message may have started sending.",
			"queue.editFailed": "Edit failed: the message may have started sending.",
			"queue.editFailed.pulledBack": "Edit failed; the content was moved back to the composer, please review and resend.",
			"steer.inflight": "{n} inserting",
			"steer.now": "Interrupt and send",
			"steer.now.aria": "Red: interrupt the running action and send now",
			"steer.now.unsupported": "Contains non-text content; interrupting is unsupported",
			"steer.nowFailed": "Interrupt failed, please retry.",
			"steer.next": "Send after action",
			"steer.next.aria": "Yellow: insert after the current action finishes",
			"steer.nextFailed": "Steering failed, please retry.",
			"steer.later": "Queue for next turn",
			"steer.later.aria": "Green: queue; processed after all previously steered actions finish",
			"steer.revoke": "Pull back to queue",
			"steer.revoke.aria": "Green: revoke the insertion and queue for the next turn",
			"steer.revoke.unsupported": "Contains non-text content; revoking is unsupported",
			"steer.revokeFailed": "Revoke failed, please retry.",
			"steer.moveUp": "Move up",
			"steer.moveDown": "Move down",
			"steer.reorder.unsupported": "Contains non-text content; reordering is unsupported",
			"steer.reorderFailed": "Reorder failed, please retry.",
			"steer.reorderStale": "The queue changed; this reorder was cancelled, please retry.",
			"steer.dragReorder": "Drag to reorder",
			"steer.pullBack": "Edit in composer",
			"steer.pullBack.unsupported": "Contains non-text content; pulling back is unsupported",
			"steer.pullBack.composerBusy": "The composer already has content; send or clear it first",
			"steer.pullBackFailed": "Pull back failed, please retry.",
			"steer.badge.now": "interrupting",
			"steer.badge.next": "steering",
			"steer.badge.later": "queued",
			"steer.unavailable.running": "Planning requires a running session",
			"steer.clear": "Cancel and clear",
			"steer.clear.confirm": "Confirm clear?",
			"steer.clear.cancel": "Cancel clearing",
			"steer.clear.aria": "Cancel the current run and clear all queued messages",
			"steer.clearFailed": "Cancel and clear failed, please retry.",
			"steer.freeze": "Freeze session",
			"steer.resume": "Resume session",
			"steer.frozen": "Frozen: the current turn finishes, then the queue pauses until resumed",
			"steer.frozenInput": "Frozen: input paused, resume to continue",
			"steer.frozenBadge": "frozen",
			"steer.freezeFailed": "Freeze failed, please retry.",
			"steer.resumeFailed": "Resume failed, please retry."
		};
		//#endregion
		//#region src/client/freeze-store.ts
		/** Session id → per-session freeze state. */
		const states = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Set();
		/** Stable empty snapshot: `useSyncExternalStore` needs a reference-stable
		*  value for unset sessions so unchanged consumers never re-render. */
		const EMPTY = {
			frozen: false,
			pending: []
		};
		/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
		const freezeStore = {
			/** Snapshot for one session; reference-stable until that session changes. */
			getSnapshot(sessionId) {
				return states.get(sessionId) ?? EMPTY;
			},
			subscribe(listener) {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			},
			/** Replace one session's state; unset sessions fall back to EMPTY. */
			set(sessionId, next) {
				if (next.frozen === false && next.pending.length === 0) states.delete(sessionId);
				else states.set(sessionId, next);
				emit();
			}
		};
		/** Edit one detached queued message's text in place. */
		function updatePendingAt(sessionId, index, text) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const entry = pending[index];
			if (entry === void 0) return;
			const next = [...pending];
			next[index] = {
				...entry,
				text
			};
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		/** Change one detached queued message's planned insertion tier. */
		function setTierAt(sessionId, index, tier) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const entry = pending[index];
			if (entry === void 0) return;
			const next = [...pending];
			next[index] = {
				...entry,
				tier
			};
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		/** Remove one detached queued message. */
		function removePendingAt(sessionId, index) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			freezeStore.set(sessionId, {
				frozen: true,
				pending: pending.filter((_, i) => i !== index)
			});
		}
		/** Move one detached queued message to a new position (reorder while frozen). */
		function movePending(sessionId, from, to) {
			if (from === to) return;
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const next = [...pending];
			const [moved] = next.splice(from, 1);
			if (moved === void 0) return;
			next.splice(to, 0, moved);
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		function emit() {
			for (const listener of listeners) listener();
		}
		//#endregion
		//#region \0dsh-css:E:\test\rewrite-agently\dsh-input-traffic\src\client\steer-queue-dock.module.css.mjs
		const css$1 = ".cev0eq_dock{width:100%}.cev0eq_panel{background:var(--dsw-alias-bg-layer-1,#fffc);border:1px solid var(--dsw-alias-border-l2,#00000014);border-radius:10px;overflow:hidden}.cev0eq_toolbar{border-bottom:1px solid var(--dsw-alias-border-l2,#0000000f);align-items:center;gap:8px;padding:4px 8px;display:flex}.cev0eq_header{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:2px 6px;font-size:12px;display:inline-flex}.cev0eq_header:disabled{cursor:default}.cev0eq_lead{color:var(--dsw-alias-label-tertiary,#9ca3af);display:inline-flex}.cev0eq_count{font-weight:600}.cev0eq_chevron{color:var(--dsw-alias-label-tertiary,#9ca3af);display:inline-flex}.cev0eq_toolbarActions{margin-left:auto}.cev0eq_clear{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.cev0eq_freeze{border:1px solid var(--dsw-alias-border-l3,#0000001f);color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.cev0eq_freeze[aria-pressed=true]{border-color:var(--dsw-alias-state-success-primary,#30a46c);color:var(--dsw-alias-state-success-primary,#30a46c)}.cev0eq_freeze:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.cev0eq_freeze:disabled{opacity:.5;cursor:default}.cev0eq_frozenBanner{border-bottom:1px solid var(--dsw-alias-border-l2,#0000000f);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 8%, transparent);color:var(--dsw-alias-state-success-primary,#30a46c);padding:4px 10px;font-size:12px}.cev0eq_frozenList{margin:0;padding:4px;list-style:none}.cev0eq_frozenRow{border-radius:6px;align-items:center;gap:8px;padding:4px 6px;display:flex}.cev0eq_frozenMark{color:var(--dsw-alias-label-tertiary,#9ca3af);flex:none;margin-left:auto;font-size:11px}.cev0eq_clear:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#0000001f);background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.cev0eq_clear:disabled{opacity:.5;cursor:default}.cev0eq_clearConfirm{border-color:var(--dsw-alias-state-error-primary,#e5484d);color:var(--dsw-alias-state-error-primary,#e5484d)}.cev0eq_clearConfirm:hover:not(:disabled){border-color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#e5484d) 8%, transparent)}.cev0eq_clearCancel{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.cev0eq_clearCancel:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.cev0eq_clearLabel{font-size:12px}.cev0eq_list{margin:0;padding:4px;list-style:none}.cev0eq_row{border-radius:6px;align-items:center;gap:8px;padding:4px 6px;display:flex}.cev0eq_row[draggable=true]{cursor:grab}.cev0eq_row[draggable=true]:active{cursor:grabbing}.cev0eq_rowDragOver{outline:2px dashed var(--dsw-alias-border-l4,#00000040);outline-offset:-2px;background:var(--dsw-alias-interactive-bg-hover,#0000000d)}.cev0eq_row:hover{background:var(--dsw-alias-interactive-bg-hover,#00000008)}.cev0eq_row[data-editing]{align-items:flex-start}.cev0eq_preview{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary,#1f2937);flex:1;font-size:13px;overflow:hidden}.cev0eq_badge{white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:4px;padding:1px 6px;font-size:11px;line-height:16px;display:inline-flex}.cev0eq_badgeLabel{color:inherit}.cev0eq_badgeNow{color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#e5484d) 10%, transparent)}.cev0eq_badgeNext{color:var(--dsw-alias-state-warn-primary,#e8a33d);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#e8a33d) 12%, transparent)}.cev0eq_badgeLater{color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 12%, transparent)}.cev0eq_badgeNow .cev0eq_dot{background:var(--dsw-alias-state-error-primary,#e5484d)}.cev0eq_badgeNext .cev0eq_dot{background:var(--dsw-alias-state-warn-primary,#e8a33d)}.cev0eq_badgeLater .cev0eq_dot{background:var(--dsw-alias-state-success-primary,#30a46c)}.cev0eq_steeringList{margin:0;padding:0 4px 4px;list-style:none}.cev0eq_steeringList .cev0eq_row{opacity:.85}.cev0eq_editor{border:1px solid var(--dsw-alias-border-l3,#00000026);background:var(--dsw-alias-bg-layer-2,#fff);resize:none;border-radius:6px;flex:1;min-width:0;max-height:160px;padding:4px 6px;font-size:13px;line-height:20px;overflow-y:auto}.cev0eq_actions{align-items:center;gap:2px;display:inline-flex}.cev0eq_action{width:24px;height:24px;color:var(--dsw-alias-label-tertiary,#9ca3af);cursor:pointer;background:0 0;border:0;border-radius:6px;justify-content:center;align-items:center;display:inline-flex}.cev0eq_action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000d);color:var(--dsw-alias-label-primary,#1f2937)}.cev0eq_action:disabled{opacity:.4;cursor:default}.cev0eq_plan{border-left:1px solid var(--dsw-alias-border-l2,#00000014);align-items:center;gap:2px;margin-left:4px;padding-left:6px;display:inline-flex}.cev0eq_tier{cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;justify-content:center;align-items:center;width:20px;height:20px;padding:0;display:inline-flex}.cev0eq_tier:hover:not(:disabled){border-color:var(--dsw-alias-border-l4,#0003)}.cev0eq_tier:disabled{cursor:default}.cev0eq_tierLater{border-color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 12%, transparent)}.cev0eq_dot{border-radius:50%;width:10px;height:10px}.cev0eq_tierNow .cev0eq_dot{background:var(--dsw-alias-state-error-primary,#e5484d)}.cev0eq_tierNext .cev0eq_dot{background:var(--dsw-alias-state-warn-primary,#e8a33d)}.cev0eq_tierLater .cev0eq_dot{background:var(--dsw-alias-state-success-primary,#30a46c)}";
		const tagId$1 = "dsh-input-traffic/steer-queue-dock.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-input-traffic";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var steer_queue_dock_module_css_default = {
			"frozenMark": "cev0eq_frozenMark",
			"tierNow": "cev0eq_tierNow",
			"tierLater": "cev0eq_tierLater",
			"toolbar": "cev0eq_toolbar",
			"clearConfirm": "cev0eq_clearConfirm",
			"tierNext": "cev0eq_tierNext",
			"badgeNow": "cev0eq_badgeNow",
			"dot": "cev0eq_dot",
			"actions": "cev0eq_actions",
			"list": "cev0eq_list",
			"steeringList": "cev0eq_steeringList",
			"header": "cev0eq_header",
			"toolbarActions": "cev0eq_toolbarActions",
			"tier": "cev0eq_tier",
			"rowDragOver": "cev0eq_rowDragOver",
			"row": "cev0eq_row",
			"frozenList": "cev0eq_frozenList",
			"frozenRow": "cev0eq_frozenRow",
			"badge": "cev0eq_badge",
			"plan": "cev0eq_plan",
			"badgeNext": "cev0eq_badgeNext",
			"count": "cev0eq_count",
			"clearCancel": "cev0eq_clearCancel",
			"editor": "cev0eq_editor",
			"action": "cev0eq_action",
			"badgeLabel": "cev0eq_badgeLabel",
			"frozenBanner": "cev0eq_frozenBanner",
			"badgeLater": "cev0eq_badgeLater",
			"clear": "cev0eq_clear",
			"preview": "cev0eq_preview",
			"panel": "cev0eq_panel",
			"lead": "cev0eq_lead",
			"chevron": "cev0eq_chevron",
			"dock": "cev0eq_dock",
			"freeze": "cev0eq_freeze",
			"clearLabel": "cev0eq_clearLabel"
		};
		//#endregion
		//#region src/client/steer-queue-dock.tsx
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
		/** Busy marker for a whole-queue rebuild (reorder); locks every row action. */
		const REORDER_MARK = "__reorder__";
		/** localStorage key for the manual collapse state (dsh-queue-plus parity). */
		const COLLAPSE_KEY = "dsh-input-traffic:collapsed";
		/**
		* Project the tier badge of one inbox row from its placement. Pure so the
		* row rendering and its tests share one truth.
		* @param placement - the inbox projection placement.
		* @returns the tier badge, or null for non-visible context rows.
		*/
		function badgeFor(placement) {
			if (placement === "steering") return "next";
			if (placement === "queued") return "later";
			return null;
		}
		/**
		* Auto-grow one edit textarea to its content. The CSS max-height caps the
		* growth; beyond it the textarea scrolls internally. Height is reset first so
		* shrink (deleting lines) also tracks the content.
		* @param el - the textarea to resize in place.
		*/
		function resizeEditor(el) {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}
		/**
		* Queue strip with three-tier planning: one item renders directly; multiple
		* items default to a collapsible count header; an empty queue renders nothing.
		*/
		function SteerQueueDock({ sessionId, useSession, input, updateQueue, cancel, send, setDraft, notify, t }) {
			const inbox = useSession((s) => s.queue);
			const queue = (0, react.useMemo)(() => inbox.filter((row) => row.placement === "queued"), [inbox]);
			const steering = (0, react.useMemo)(() => inbox.filter((row) => row.placement === "steering"), [inbox]);
			const running = useSession((s) => s.running);
			const queueMutable = useSession((s) => s.subagent === null);
			const [editing, setEditing] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(null);
			const [clearing, setClearing] = (0, react.useState)(false);
			const [confirmClear, setConfirmClear] = (0, react.useState)(false);
			const confirmTimer = (0, react.useRef)(null);
			const dragIndex = (0, react.useRef)(null);
			const [dragOver, setDragOver] = (0, react.useState)(null);
			const [collapsed, setCollapsed] = (0, react.useState)(() => {
				try {
					const v = localStorage.getItem(COLLAPSE_KEY);
					return v === null ? true : v === "1";
				} catch {
					return true;
				}
			});
			const { frozen, pending: frozenPending } = (0, react.useSyncExternalStore)(freezeStore.subscribe, () => freezeStore.getSnapshot(sessionId ?? ""));
			const sid = sessionId ?? "";
			const listId = (0, react.useId)();
			const editorRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (queue.length === 0 && !collapsed) setCollapsed(true);
				if (editing !== null && !editing.id.startsWith("frozen:") && (!queueMutable || !queue.some((row) => row.id === editing.id))) setEditing(null);
			}, [
				collapsed,
				editing,
				queue,
				queueMutable
			]);
			(0, react.useEffect)(() => {
				try {
					localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
				} catch {}
			}, [collapsed]);
			(0, react.useEffect)(() => () => {
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
			}, []);
			const editingId = editing?.id;
			(0, react.useEffect)(() => {
				if (editingId === void 0) return;
				const el = editorRef.current;
				if (el !== null) resizeEditor(el);
			}, [editingId]);
			if (queue.length === 0 && steering.length === 0 && !running && !frozen) return null;
			const interactionActive = queueMutable && (editing !== null || busy !== null || clearing);
			const expanded = !collapsed || interactionActive;
			const listVisible = queue.length === 1 || expanded;
			const planDisabled = !queueMutable || !running || frozen;
			const nothingPending = queue.length === 0 && steering.length === 0;
			const reorderUnsupported = queue.some((row) => row.text === null);
			const composerEmpty = input.draft.trim() === "";
			const applyAction = async (itemId, action, failure) => {
				setBusy(itemId);
				try {
					await updateQueue(itemId, action);
					return true;
				} catch {
					notify("error", failure);
					return false;
				} finally {
					setBusy((current) => current === itemId ? null : current);
				}
			};
			const saveEdit = async () => {
				if (editing === null || editing.text.trim() === "") return;
				const itemId = editing.id;
				const text = editing.text;
				setBusy(itemId);
				try {
					await updateQueue(itemId, {
						kind: "edit",
						content: [{
							type: "text",
							text
						}]
					});
					setEditing(null);
				} catch {
					if (input.draft.trim() === "") {
						setDraft(text);
						setEditing(null);
						notify("error", t("queue.editFailed.pulledBack"));
					} else notify("error", t("queue.editFailed"));
				} finally {
					setBusy((current) => current === itemId ? null : current);
				}
			};
			const steerRow = async (row, tier) => {
				setBusy(row.id);
				try {
					if (tier === "now") {
						await cancel();
						await updateQueue(row.id, { kind: "remove" });
						if (row.text !== null) await send(row.text);
					} else await updateQueue(row.id, { kind: "steer" });
				} catch {
					notify("error", tier === "now" ? t("steer.nowFailed") : t("steer.nextFailed"));
				} finally {
					setBusy((current) => current === row.id ? null : current);
				}
			};
			/**
			* Revoke a steered (yellow) or interrupting (red) row back to later: remove
			* the admitted row and re-send its text as a queued follow-up, so it lands
			* in next-turn again (the yellow flow is reversible).
			*/
			const revokeToLater = async (row) => {
				if (row.text === null) return;
				setBusy(row.id);
				try {
					await updateQueue(row.id, { kind: "remove" });
					await send(row.text);
				} catch {
					notify("error", t("steer.revokeFailed"));
				} finally {
					setBusy((current) => current === row.id ? null : current);
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
					for (const row of rows) try {
						await updateQueue(row.id, { kind: "remove" });
					} catch (error) {
						if (error instanceof Error && error.message.includes("queue-item-not-found")) {
							notify("error", t("steer.reorderStale"));
							return;
						}
						throw error;
					}
					for (const row of next) if (row.text !== null) await send(row.text);
				} catch {
					notify("error", t("steer.reorderFailed"));
				} finally {
					setBusy(null);
				}
			};
			/**
			* Move one queued row up/down in the FIFO order (arrow buttons).
			*/
			const reorder = async (rowId, delta) => {
				const rows = queue;
				const index = rows.findIndex((row) => row.id === rowId);
				const target = index + delta;
				if (index < 0 || target < 0 || target >= rows.length) return;
				const next = [...rows];
				const swapped = next[index];
				next[index] = next[target];
				next[target] = swapped;
				if (next.some((row) => row.text === null)) {
					notify("error", t("steer.reorder.unsupported"));
					return;
				}
				await rebuildQueue(rows, next);
			};
			/**
			* Move one row to an absolute position (drag-and-drop drop handler).
			*/
			const reorderTo = async (fromIndex, toIndex) => {
				if (fromIndex === toIndex) return;
				const rows = queue;
				if (rows[fromIndex] === void 0 || rows[toIndex] === void 0) return;
				const next = [...rows];
				const [moved] = next.splice(fromIndex, 1);
				if (moved === void 0) return;
				next.splice(toIndex, 0, moved);
				if (next.some((row) => row.text === null)) {
					notify("error", t("steer.reorder.unsupported"));
					return;
				}
				await rebuildQueue(rows, next);
			};
			/** Arm or execute the two-step clear confirmation. */
			const armClear = () => {
				if (confirmClear) {
					if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
					setConfirmClear(false);
					clearAll();
					return;
				}
				setConfirmClear(true);
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
				confirmTimer.current = setTimeout(() => setConfirmClear(false), 3e3);
			};
			/** Abort the armed clear confirmation (the explicit cancel button). */
			const cancelClear = () => {
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
				setConfirmClear(false);
			};
			/** Save an in-place edit of one detached (frozen) queued message. */
			const saveFrozenEdit = async (index) => {
				if (editing === null) return;
				const text = editing.text.trim();
				if (text === "") {
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
				if (row.text === null) return;
				setDraft(row.text);
				setBusy(row.id);
				try {
					await updateQueue(row.id, { kind: "remove" });
				} catch {
					notify("error", t("steer.pullBackFailed"));
				} finally {
					setBusy((current) => current === row.id ? null : current);
				}
			};
			const clearAll = async () => {
				setClearing(true);
				const pending = [...queue, ...steering];
				try {
					await cancel();
					await Promise.all(pending.map((row) => updateQueue(row.id, { kind: "remove" }).catch(() => void 0)));
				} catch {
					notify("error", t("steer.clearFailed"));
				} finally {
					setClearing(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: steer_queue_dock_module_css_default.dock,
				"data-steer-dock": "",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: steer_queue_dock_module_css_default.panel,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: steer_queue_dock_module_css_default.toolbar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: steer_queue_dock_module_css_default.header,
								"aria-controls": listId,
								"aria-expanded": expanded,
								disabled: queue.length <= 1 || interactionActive,
								onClick: () => {
									setCollapsed((value) => !value);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutline14, {})
									}),
									queue.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.count,
										children: t("queue.count", { n: queue.length })
									}),
									queue.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.chevron,
										"aria-hidden": true,
										children: expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutline14, {})
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: steer_queue_dock_module_css_default.toolbarActions,
								children: [confirmClear && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: steer_queue_dock_module_css_default.clearCancel,
									"aria-label": t("steer.clear.cancel"),
									disabled: clearing || busy !== null || nothingPending,
									onClick: cancelClear,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.clearLabel,
										children: t("steer.clear.cancel")
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: confirmClear ? t("steer.clear.confirm") : t("steer.clear"),
									side: "top",
									delayMs: 500,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${steer_queue_dock_module_css_default.clear} ${confirmClear ? steer_queue_dock_module_css_default.clearConfirm : ""}`,
										"aria-label": confirmClear ? t("steer.clear.confirm") : t("steer.clear"),
										disabled: clearing || busy !== null || nothingPending,
										onClick: armClear,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.clearLabel,
											children: confirmClear ? t("steer.clear.confirm") : t("steer.clear")
										})]
									})
								})]
							})]
						}),
						frozen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: steer_queue_dock_module_css_default.frozenBanner,
							role: "status",
							children: t("steer.frozen")
						}),
						frozen && frozenPending.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: steer_queue_dock_module_css_default.frozenList,
							"data-testid": "frozen-list",
							children: frozenPending.map((entry, i) => {
								const editingFrozen = editing?.id === `frozen:${i}`;
								const text = entry.text;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: `${steer_queue_dock_module_css_default.frozenRow} ${dragOver === i && frozen ? steer_queue_dock_module_css_default.rowDragOver : ""}`,
									"data-tier": entry.tier === "force" ? "now" : entry.tier === "safe_point" ? "next" : "later",
									"data-editing": editingFrozen ? "" : void 0,
									draggable: !editingFrozen,
									title: !editingFrozen ? t("steer.dragReorder") : void 0,
									onDragStart: (event) => {
										if (editingFrozen) return;
										dragIndex.current = i;
										event.dataTransfer.effectAllowed = "move";
										event.dataTransfer.setData("text/plain", String(i));
									},
									onDragOver: (event) => {
										if (dragIndex.current === null) return;
										event.preventDefault();
										setDragOver(i);
									},
									onDrop: (event) => {
										event.preventDefault();
										const from = dragIndex.current;
										dragIndex.current = null;
										setDragOver(null);
										if (from !== null) movePending(sid, from, i);
									},
									onDragEnd: () => {
										dragIndex.current = null;
										setDragOver(null);
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.lead,
											"aria-hidden": true,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutline14, {})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
											tier: entry.tier === "force" ? "now" : entry.tier === "safe_point" ? "next" : "later",
											t
										}),
										editingFrozen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											ref: editorRef,
											autoFocus: true,
											className: steer_queue_dock_module_css_default.editor,
											"aria-label": t("queue.edit"),
											rows: 1,
											value: editing?.text ?? text,
											onChange: (event) => {
												setEditing({
													id: `frozen:${i}`,
													text: event.currentTarget.value
												});
											},
											onInput: (event) => {
												resizeEditor(event.currentTarget);
											},
											onKeyDown: (event) => {
												if (event.key === "Escape") {
													setEditing(null);
													return;
												}
												if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
													event.preventDefault();
													saveFrozenEdit(i);
												}
											}
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.preview,
											children: text
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: steer_queue_dock_module_css_default.actions,
											children: editingFrozen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.save"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.save"),
													disabled: editing === null || editing.text.trim() === "",
													onClick: () => {
														saveFrozenEdit(i);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 })
												})
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.cancelEdit"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.cancelEdit"),
													onClick: () => {
														setEditing(null);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
												})
											})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("steer.moveUp"),
													side: "bottom",
													delayMs: 500,
													disabled: i === 0,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("steer.moveUp"),
														disabled: i === 0,
														onClick: () => movePending(sid, i, i - 1),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutline14, {})
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("steer.moveDown"),
													side: "bottom",
													delayMs: 500,
													disabled: i === frozenPending.length - 1,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("steer.moveDown"),
														disabled: i === frozenPending.length - 1,
														onClick: () => movePending(sid, i, i + 1),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("queue.edit"),
													side: "bottom",
													delayMs: 500,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("queue.edit"),
														onClick: () => {
															setEditing({
																id: `frozen:${i}`,
																text
															});
														},
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 14 })
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("queue.remove"),
													side: "bottom",
													delayMs: 500,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("queue.remove"),
														onClick: () => removePendingAt(sid, i),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 })
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: steer_queue_dock_module_css_default.plan,
													role: "group",
													"aria-label": t("steer.later.aria"),
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.now"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNow}`,
																"aria-label": t("steer.now"),
																"aria-pressed": entry.tier === "force" || void 0,
																onClick: () => setTierAt(sid, i, "force"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.next"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNext}`,
																"aria-label": t("steer.next"),
																"aria-pressed": entry.tier === "safe_point" || void 0,
																onClick: () => setTierAt(sid, i, "safe_point"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.later"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
																"aria-label": t("steer.later"),
																"aria-pressed": entry.tier === "queue" || void 0,
																onClick: () => setTierAt(sid, i, "queue"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														})
													]
												})
											] })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.frozenMark,
											children: t("steer.frozenBadge")
										})
									]
								}, i);
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							id: listId,
							className: steer_queue_dock_module_css_default.list,
							hidden: !listVisible,
							children: listVisible && queue.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: `${steer_queue_dock_module_css_default.row} ${dragOver === index ? steer_queue_dock_module_css_default.rowDragOver : ""}`,
								"data-tier": badgeFor("queued") ?? void 0,
								"data-editing": editing?.id === row.id ? "" : void 0,
								draggable: queueMutable && !reorderUnsupported && busy === null && !frozen,
								title: queueMutable && !reorderUnsupported && busy === null && !frozen ? t("steer.dragReorder") : void 0,
								onDragStart: (event) => {
									dragIndex.current = index;
									event.dataTransfer.effectAllowed = "move";
									event.dataTransfer.setData("text/plain", String(index));
								},
								onDragOver: (event) => {
									if (dragIndex.current === null) return;
									event.preventDefault();
									setDragOver(index);
								},
								onDrop: (event) => {
									event.preventDefault();
									const from = dragIndex.current;
									dragIndex.current = null;
									setDragOver(null);
									if (from !== null) reorderTo(from, index);
								},
								onDragEnd: () => {
									dragIndex.current = null;
									setDragOver(null);
								},
								children: [
									queue.length === 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutline14, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
										tier: badgeFor("queued"),
										t
									}),
									editing?.id === row.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										ref: editorRef,
										autoFocus: true,
										className: steer_queue_dock_module_css_default.editor,
										"aria-label": t("queue.edit"),
										rows: 1,
										value: editing.text,
										onChange: (event) => {
											setEditing({
												id: row.id,
												text: event.currentTarget.value
											});
										},
										onInput: (event) => {
											resizeEditor(event.currentTarget);
										},
										onKeyDown: (event) => {
											if (event.key === "Escape") {
												setEditing(null);
												return;
											}
											if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
												event.preventDefault();
												saveEdit();
											}
										}
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.preview,
										children: row.preview
									}),
									queueMutable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: steer_queue_dock_module_css_default.actions,
										children: editing?.id === row.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("queue.save"),
											side: "bottom",
											delayMs: 500,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: steer_queue_dock_module_css_default.action,
												"aria-label": t("queue.save"),
												disabled: busy !== null || editing.text.trim() === "",
												onClick: () => {
													saveEdit();
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 })
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("queue.cancelEdit"),
											side: "bottom",
											delayMs: 500,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: steer_queue_dock_module_css_default.action,
												"aria-label": t("queue.cancelEdit"),
												disabled: busy !== null,
												onClick: () => {
													setEditing(null);
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
											})
										})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("steer.moveUp"),
												side: "bottom",
												delayMs: 500,
												disabled: frozen || reorderUnsupported,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("steer.moveUp"),
													title: reorderUnsupported ? t("steer.reorder.unsupported") : void 0,
													disabled: busy !== null || frozen || reorderUnsupported,
													onClick: () => {
														reorder(row.id, -1);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutline14, {})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("steer.moveDown"),
												side: "bottom",
												delayMs: 500,
												disabled: frozen || reorderUnsupported,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("steer.moveDown"),
													title: reorderUnsupported ? t("steer.reorder.unsupported") : void 0,
													disabled: busy !== null || frozen || reorderUnsupported,
													onClick: () => {
														reorder(row.id, 1);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("steer.pullBack"),
												side: "bottom",
												delayMs: 500,
												disabled: row.text === null || !composerEmpty,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("steer.pullBack"),
													title: row.text === null ? t("steer.pullBack.unsupported") : !composerEmpty ? t("steer.pullBack.composerBusy") : void 0,
													disabled: busy !== null || frozen || row.text === null || !composerEmpty,
													onClick: () => {
														pullBackToComposer(row);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutline16, {})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.edit"),
												side: "bottom",
												delayMs: 500,
												disabled: row.text === null,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.edit"),
													title: row.text === null ? t("queue.edit.unsupported") : void 0,
													disabled: busy !== null || row.text === null,
													onClick: () => {
														if (row.text !== null) setEditing({
															id: row.id,
															text: row.text
														});
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 14 })
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.remove"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.remove"),
													disabled: busy !== null,
													onClick: () => {
														applyAction(row.id, { kind: "remove" }, t("queue.removeFailed"));
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 })
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: steer_queue_dock_module_css_default.plan,
												role: "group",
												"aria-label": t("steer.later.aria"),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.now"),
														side: "bottom",
														delayMs: 500,
														disabled: planDisabled || row.text === null,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNow}`,
															"aria-label": t("steer.now"),
															title: planDisabled ? t("steer.unavailable.running") : row.text === null ? t("steer.now.unsupported") : void 0,
															disabled: busy !== null || planDisabled || row.text === null,
															onClick: () => {
																steerRow(row, "now");
															},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.next"),
														side: "bottom",
														delayMs: 500,
														disabled: planDisabled,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNext}`,
															"aria-label": t("steer.next"),
															title: planDisabled ? t("steer.unavailable.running") : void 0,
															disabled: busy !== null || planDisabled,
															onClick: () => {
																steerRow(row, "next");
															},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.later"),
														side: "bottom",
														delayMs: 500,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
															"aria-label": t("steer.later"),
															"aria-pressed": true,
															disabled: busy !== null || clearing,
															onClick: () => {},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													})
												]
											})
										] })
									})
								]
							}, row.id))
						}),
						steering.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: steer_queue_dock_module_css_default.steeringList,
							"data-steering-list": "",
							children: steering.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: steer_queue_dock_module_css_default.row,
								"data-tier": badgeFor("steering") ?? void 0,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutline14, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
										tier: badgeFor("steering"),
										t
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.preview,
										children: row.preview
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: steer_queue_dock_module_css_default.actions,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("steer.revoke"),
											side: "bottom",
											delayMs: 500,
											disabled: row.text === null,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
												"aria-label": t("steer.revoke"),
												title: row.text === null ? t("steer.revoke.unsupported") : void 0,
												disabled: busy !== null || row.text === null || frozen,
												onClick: () => {
													revokeToLater(row);
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: steer_queue_dock_module_css_default.dot,
													"aria-hidden": true
												})
											})
										})
									})
								]
							}, row.id))
						})
					]
				})
			});
		}
		/** Badge label keys per tier. */
		const BADGE_KEYS = {
			now: "steer.badge.now",
			next: "steer.badge.next",
			later: "steer.badge.later"
		};
		/** Badge tint classes per tier (present at bundle time; typed through the css-modules declaration). */
		const BADGE_CLASSES = {
			now: steer_queue_dock_module_css_default.badgeNow,
			next: steer_queue_dock_module_css_default.badgeNext,
			later: steer_queue_dock_module_css_default.badgeLater
		};
		/** One row's tier badge: colored dot + label; context rows render nothing. */
		function SteerBadge({ tier, t }) {
			if (tier === null) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: `${steer_queue_dock_module_css_default.badge} ${BADGE_CLASSES[tier]}`,
				"data-badge": tier,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: steer_queue_dock_module_css_default.dot,
					"aria-hidden": true
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: steer_queue_dock_module_css_default.badgeLabel,
					children: t(BADGE_KEYS[tier])
				})]
			});
		}
		//#endregion
		//#region src/client/session-guard-bridge.ts
		/**
		* input-traffic ↔ dsh-session-guard 透传桥（D8 fail-open）。
		*
		* input-traffic **只做冻结增强**（队列冻结/解冻），服务端会话门（暂停/恢复会话）
		* 归 dsh-session-guard 插件。冻结/解冻按钮触发时，尽力调用
		* `sessionGuard.stopNextTurn` / `resume`；**插件未装**（路由 404 / 网络失败 /
		* 返回错误）→ 静默跳过，**绝不报错**，前端冻结仍正常生效。
		*
		* 不吸收任何 auto-continue / 重试逻辑（重试归后端 dsh-session-guard，D9）。
		*/
		/** 尽力调用 sessionGuard.stopNextTurn（停掉 session 下一回合）。失败静默。 */
		async function sessionGuardStopNextTurn(sessionId) {
			return callGuard(sessionId, "stopNextTurn");
		}
		/** 尽力调用 sessionGuard.resume。失败静默。 */
		async function sessionGuardResume(sessionId) {
			return callGuard(sessionId, "resume");
		}
		async function callGuard(sessionId, action) {
			try {
				const res = await fetch("/session-guard/rpc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						sessionId,
						action
					})
				});
				if (!res.ok) return false;
				return (await res.json().catch(() => null))?.ok === true;
			} catch {
				return false;
			}
		}
		try {
			globalThis.__DSH_SESSION_GUARD_BRIDGE__ = true;
		} catch {}
		//#endregion
		//#region \0dsh-css:E:\test\rewrite-agently\dsh-input-traffic\src\client\freeze-button.module.css.mjs
		const css = ".Klmgza_freeze{border:1px solid var(--dsw-alias-border-l3,#0000001f);height:24px;color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;white-space:nowrap;background:0 0;border-radius:6px;align-items:center;gap:4px;padding:0 8px;font-size:12px;display:inline-flex}.Klmgza_freeze:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.Klmgza_freeze[aria-pressed=true]{border-color:var(--dsw-alias-state-success-primary,#30a46c);color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 8%, transparent)}.Klmgza_label{font-size:12px}";
		const tagId = "dsh-input-traffic/freeze-button.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-input-traffic";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var freeze_button_module_css_default = {
			"label": "Klmgza_label",
			"freeze": "Klmgza_freeze"
		};
		//#endregion
		//#region src/client/freeze-button.tsx
		/**
		* Session freeze/resume control, mounted in the composer's right tool row
		* (`conversation.input.right`) so it is reachable before anything queues.
		*
		* Peak-hour pause semantics: freeze does NOT interrupt the running turn —it
		* finishes naturally. The queued messages are detached (removed, preserved in
		* the shared store), so the driver finds no pending work and stops after the
		* current turn. Resume re-submits the preserved texts, waking the driver and
		* continuing the queue.
		*
		* dsh-session-guard 协作（D8 fail-open）：
		* - 冻结 = 前端摘队列（本插件）+ composer block（阻止新输入漏进对话） + 尽力调服务端
		*   sessionGuard.stopNextTurn（停掉 session 下一回合；session-guard 未装时静默跳过）。
		* - 解冻 = 清 composer block + **先** await sessionGuard.resume（让被打断回合的自然
		*   下一步先发生），**再**重投队列（later 级条目因此排在自然 next turn 之后，不再插队）。
		* - 本插件只做冻结增强，不承担重试/暂停决策（归后端，D9）。
		*/
		/**
		* Freeze/resume toggle for the peak-hour scenario.
		* @param props - slot props; the session snapshot drives the detach list.
		*/
		function FreezeButton({ session, updateQueue, cancel, send, sendSteer, sessionId, setComposerBlock, notify, t }) {
			const sid = sessionId ?? "";
			const { frozen } = (0, react.useSyncExternalStore)(freezeStore.subscribe, () => freezeStore.getSnapshot(sid));
			const freeze = async () => {
				const rows = session.queue.filter((row) => row.placement === "queued" || row.placement === "steering");
				const pending = rows.flatMap((row) => row.text === null ? [] : [{
					text: row.text,
					tier: row.placement === "steering" ? "safe_point" : "queue"
				}]);
				await Promise.all(rows.map((row) => updateQueue(row.id, { kind: "remove" }).catch(() => void 0)));
				freezeStore.set(sid, {
					frozen: true,
					pending
				});
				setComposerBlock?.(t("steer.frozenInput"));
				if (sessionId !== void 0) sessionGuardStopNextTurn(sessionId);
			};
			const resume = async () => {
				const pending = freezeStore.getSnapshot(sid).pending;
				freezeStore.set(sid, {
					frozen: false,
					pending: []
				});
				setComposerBlock?.(void 0);
				try {
					if (sessionId !== void 0) await sessionGuardResume(sessionId);
					for (const entry of pending) {
						if (entry.tier === "force") await cancel();
						if (entry.tier === "safe_point" && sendSteer !== void 0) await sendSteer(entry.text);
						else await send(entry.text);
					}
				} catch {
					notify("error", t("steer.resumeFailed"));
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: freeze_button_module_css_default.freeze,
				"aria-label": frozen ? t("steer.resume") : t("steer.freeze"),
				"aria-pressed": frozen || void 0,
				title: frozen ? t("steer.frozen") : void 0,
				onClick: () => {
					if (frozen) resume();
					else freeze();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: freeze_button_module_css_default.label,
					children: frozen ? t("steer.resume") : t("steer.freeze")
				})
			});
		}
		//#endregion
		//#region src/client/hide-enter-row.tsx
		/** Render nothing: the official busy-Enter row is hidden while mounted. */
		function HideEnterRow(_props) {
			return null;
		}
		//#endregion
		//#region src/client/index.ts
		/** Durable conversation settings namespace owned by ui-conversation. */
		const CONVERSATION_SETTINGS_NAMESPACE = "ui-conversation";
		/** Busy-Enter field inside that namespace; the plugin pins it to queue. */
		const BUSY_ENTER_FIELD = "busyEnter";
		/**
		* Deliver one plain-text message into the session's next step. The exposed
		* conversation `send` verb only queues into the next turn, so resume steers
		* through the session face's steer-mode prompt instead (no harness change).
		* @param ctx - root context (resolves the session face behind the scope).
		* @param actx - agent-scoped context of the owning session.
		* @param text - message text to deliver.
		*/
		function steerPrompt(actx, text) {
			const conversation = actx.get("conversation");
			if (conversation === void 0) return Promise.reject(/* @__PURE__ */ new Error("steer resume: conversation service unavailable"));
			return conversation.send(text);
		}
		/** Services required by the browser half. */
		const inject = [
			"slots",
			"locale",
			"sessions",
			"conversation",
			"settingsScope"
		];
		/**
		* Client plugin body: dictionaries, busy-Enter pinning, and the two slot
		* shadowings.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-input-traffic: dictionaries");
			ctx.settingsScope.bind({ namespace: CONVERSATION_SETTINGS_NAMESPACE }).set(BUSY_ENTER_FIELD, "queue");
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "queue",
				order: 20,
				priority: -1,
				locale: NS,
				inject: (sessionId) => {
					const actx = ctx.sessions.scope(sessionId);
					if (actx === void 0) throw new Error(`steer dock: session "${sessionId}" resolved no scope`);
					const conversation = actx.get("conversation");
					if (conversation === void 0) throw new Error("steer dock: conversation service unavailable");
					return {
						updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
						cancel: () => conversation.cancel(),
						send: (text) => conversation.send(text),
						setDraft: (text) => {
							conversation.input.for(actx).actions.setDraft(text);
						},
						notify: (level, text) => {
							conversation.input.for(actx).notify(level, text);
						}
					};
				}
			}, SteerQueueDock));
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "steer-freeze",
				order: 30,
				locale: NS,
				inject: (sessionId) => {
					const actx = ctx.sessions.scope(sessionId);
					if (actx === void 0) throw new Error(`steer freeze: session "${sessionId}" resolved no scope`);
					const conversation = actx.get("conversation");
					if (conversation === void 0) throw new Error("steer freeze: conversation service unavailable");
					return {
						updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
						cancel: () => conversation.cancel(),
						send: (text) => conversation.send(text),
						sendSteer: (text) => steerPrompt(actx, text),
						sessionId: String(sessionId),
						setDraft: (text) => {
							conversation.input.for(actx).actions.setDraft(text);
						},
						notify: (level, text) => {
							conversation.input.for(actx).notify(level, text);
						},
						setComposerBlock: (reason) => {
							conversation.blocks.set(sessionId, reason === void 0 ? void 0 : { reason });
						}
					};
				}
			}, FreezeButton));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "composer-enter",
				order: 20,
				priority: -1,
				locale: NS
			}, HideEnterRow));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map