import { NS, en, zh } from "./locales.js";
import { SteerQueueDock } from "./steer-queue-dock.js";
import { FreezeButton } from "./freeze-button.js";
import { HideEnterRow } from "./hide-enter-row.js";
/** Durable conversation settings namespace owned by ui-conversation. */
const CONVERSATION_SETTINGS_NAMESPACE = 'ui-conversation';
/** Busy-Enter field inside that namespace; the plugin pins it to queue. */
const BUSY_ENTER_FIELD = 'busyEnter';
/**
 * Deliver one plain-text message into the session's next step. The exposed
 * conversation `send` verb only queues into the next turn, so resume steers
 * through the session face's steer-mode prompt instead (no harness change).
 * @param ctx - root context (resolves the session face behind the scope).
 * @param actx - agent-scoped context of the owning session.
 * @param text - message text to deliver.
 */
function steerPrompt(actx, text) {
    // steer-mode prompt 面在本版（main@0.2.8）契约中未声明；resume 落到 conversation.send
    // （排队到下一轮）交付 safe_point 文本，与 feature 分支语义对齐但取当前可用 API。
    const conversation = actx.get('conversation');
    if (conversation === undefined)
        return Promise.reject(new Error('steer resume: conversation service unavailable'));
    return conversation.send(text);
}
/** Services required by the browser half. */
export const inject = ['slots', 'locale', 'sessions', 'conversation', 'settingsScope'];
/**
 * Client plugin body: dictionaries, busy-Enter pinning, and the two slot
 * shadowings.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-input-traffic: dictionaries');
    // Take over the busy-Enter behavior: plain Enter stays queue-later while
    // the official row is hidden. Pinning here also repairs a persisted `steer`
    // preference that would otherwise keep working invisibly behind the hidden
    // row. Best-effort: a memory-mode host simply accepts it locally.
    const conversationSettings = ctx.settingsScope.bind({
        namespace: CONVERSATION_SETTINGS_NAMESPACE,
    });
    void conversationSettings.set(BUSY_ENTER_FIELD, 'queue');
    // Shadow the official queue dock with the three-tier planning strip.
    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'queue',
        order: 20,
        priority: -1,
        locale: NS,
        inject: (sessionId) => {
            const actx = ctx.sessions.scope(sessionId);
            if (actx === undefined)
                throw new Error(`steer dock: session "${sessionId}" resolved no scope`);
            const conversation = actx.get('conversation');
            if (conversation === undefined)
                throw new Error('steer dock: conversation service unavailable');
            return {
                updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
                cancel: () => conversation.cancel(),
                send: (text) => conversation.send(text),
                setDraft: (text) => { conversation.input.for(actx).actions.setDraft(text); },
                notify: (level, text) => { conversation.input.for(actx).notify(level, text); },
            };
        },
    }, SteerQueueDock));
    // Composer-right freeze/resume control (reachable before anything queues).
    ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'steer-freeze',
        order: 30,
        locale: NS,
        inject: (sessionId) => {
            const actx = ctx.sessions.scope(sessionId);
            if (actx === undefined)
                throw new Error(`steer freeze: session "${sessionId}" resolved no scope`);
            const conversation = actx.get('conversation');
            if (conversation === undefined)
                throw new Error('steer freeze: conversation service unavailable');
            return {
                updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
                cancel: () => conversation.cancel(),
                send: (text) => conversation.send(text),
                // safe_point 恢复经 conversation.send 排队到下一轮（本版契约无 steer prompt 面）。
                sendSteer: (text) => steerPrompt(actx, text),
                sessionId: String(sessionId),
                setDraft: (text) => { conversation.input.for(actx).actions.setDraft(text); },
                notify: (level, text) => { conversation.input.for(actx).notify(level, text); },
                // 冻结期间 raise composer block：composer 变 inert（回车/发送按钮全部失效），
                // 输入不会漏进对话；恢复时清除。block 不锁 input.right（恢复按钮仍可点）。
                setComposerBlock: (reason) => {
                    conversation.blocks.set(sessionId, reason === undefined ? undefined : { reason });
                },
            };
        },
    }, FreezeButton));
    // Hide the official busy-Enter settings row (null render wins the cell).
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'composer-enter',
        order: 20,
        priority: -1,
        locale: NS,
    }, HideEnterRow));
}
//# sourceMappingURL=index.js.map