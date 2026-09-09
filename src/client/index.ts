/**
 * dsh-input-traffic —browser half.
 *
 * The whole takeover lives here:
 * 1. registers the `steer` dictionaries;
 * 2. pins `ui-conversation.busyEnter` to `queue` (plain Enter = green later)
 *    so the hidden official row cannot leak a stale queue/steer preference;
 * 3. shadows the official queue dock (`conversation.input.dock` cell id
 *    `queue`, priority -1) with the three-tier planning strip;
 * 4. shadows the official busy-Enter settings row (`settings.general.item`
 *    cell id `composer-enter`, priority -1) with a null render.
 *
 * ORDERING (why the dock registers at QUEUE_DOCK_ORDER instead of the
 * official dock's 20): a list slot's DISPLAY position is decided by `order`
 * alone — `ui-renderer/src/client/scoped-slots.tsx` maps the shadowing
 * winners to rows and then sorts them by `order` (both 0.1.1 and 0.1.2) —
 * while `priority` only decides which entry wins a shared cell id. Keeping
 * the official 20 therefore left the strip above any later contributor
 * (dsh-perm-gate's notice registers order 30), which pushed that notice
 * between the queue strip and the composer card. A deliberately high order
 * keeps the strip adjacent to the card; priority stays -1 so the cell
 * takeover still holds.
 *
 * All @deepseek-ai/* imports are type-only: collaboration happens through
 * cordis services and slot registration only (client bundle purity).
 */
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { IConversation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { NS, en, zh } from './locales.ts'
import { SteerQueueDock } from './steer-queue-dock.tsx'
import type { SteerQueueDockInjected } from './steer-queue-dock.tsx'
import { FreezeButton } from './freeze-button.tsx'
import { HideEnterRow } from './hide-enter-row.tsx'

/** Durable conversation settings namespace owned by ui-conversation. */
const CONVERSATION_SETTINGS_NAMESPACE = 'ui-conversation'

/** Busy-Enter field inside that namespace; the plugin pins it to queue. */
const BUSY_ENTER_FIELD = 'busyEnter'

/**
 * Display order of the queue strip inside `conversation.input.dock`.
 *
 * List rows render sorted by `order` ascending, so a value above every other
 * contributor keeps the strip as the bottom-most entry of the band — directly
 * on top of the composer card. Known contributors in both 0.1.1-rc.2 and
 * 0.1.2-rc.1: `todo` 0, `goal` 10, official `queue` 20, `dsh-perm-gate.notice`
 * 30. DSH has no "last" slot semantics, so this is a convention, not a
 * structural guarantee: a third party registering a larger value could still
 * land below us.
 */
export const QUEUE_DOCK_ORDER = 1000

/**
 * Deliver one plain-text message into the session's next step. The exposed
 * conversation `send` verb only queues into the next turn, so resume steers
 * through the session face's steer-mode prompt instead (no harness change).
 * @param ctx - root context (resolves the session face behind the scope).
 * @param actx - agent-scoped context of the owning session.
 * @param text - message text to deliver.
 */
function steerPrompt(actx: ClientContext, text: string): Promise<void> {
  // steer-mode prompt 面在本版（main@0.2.8）契约中未声明；resume 落到 conversation.send
  // （排队到下一轮）交付 safe_point 文本，与 feature 分支语义对齐但取当前可用 API。
  const conversation = actx.get<IConversation>('conversation')
  if (conversation === undefined) return Promise.reject(new Error('steer resume: conversation service unavailable'))
  return conversation.send(text)
}

/** Services required by the browser half. */
export const inject = ['slots', 'locale', 'sessions', 'conversation', 'settingsScope']

/**
 * Client plugin body: dictionaries, busy-Enter pinning, and the two slot
 * shadowings.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-input-traffic: dictionaries')

  // Take over the busy-Enter behavior: plain Enter stays queue-later while
  // the official row is hidden. Pinning here also repairs a persisted `steer`
  // preference that would otherwise keep working invisibly behind the hidden
  // row. Best-effort: a memory-mode host simply accepts it locally.
  const conversationSettings = ctx.settingsScope.bind<{ busyEnter: 'queue' | 'steer' }>({
    namespace: CONVERSATION_SETTINGS_NAMESPACE,
  })
  void conversationSettings.set(BUSY_ENTER_FIELD, 'queue')

  // Shadow the official queue dock with the three-tier planning strip. The
  // high `order` keeps it the bottom-most entry of the band (see the file
  // header); `priority: -1` is what wins the official `queue` cell.
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'queue',
    order: QUEUE_DOCK_ORDER,
    priority: -1,
    locale: NS,
    inject: (sessionId: SessionId): SteerQueueDockInjected => {
      const actx = ctx.sessions.scope(sessionId)
      if (actx === undefined) throw new Error(`steer dock: session "${sessionId}" resolved no scope`)
      const conversation = actx.get<IConversation>('conversation')
      if (conversation === undefined) throw new Error('steer dock: conversation service unavailable')
      return {
        updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
        cancel: () => conversation.cancel(),
        send: (text) => conversation.send(text),
        setDraft: (text) => { conversation.input.for(actx).actions.setDraft(text) },
        notify: (level, text) => { conversation.input.for(actx).notify(level, text) },
      }
    },
  }, SteerQueueDock))

  // Composer-right freeze/resume control (reachable before anything queues).
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'steer-freeze',
    order: 30,
    locale: NS,
    inject: (sessionId: SessionId): SteerQueueDockInjected => {
      const actx = ctx.sessions.scope(sessionId)
      if (actx === undefined) throw new Error(`steer freeze: session "${sessionId}" resolved no scope`)
      const conversation = actx.get<IConversation>('conversation')
      if (conversation === undefined) throw new Error('steer freeze: conversation service unavailable')
      return {
        updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
        cancel: () => conversation.cancel(),
        send: (text) => conversation.send(text),
        // safe_point 恢复经 conversation.send 排队到下一轮（本版契约无 steer prompt 面）。
        sendSteer: (text) => steerPrompt(actx, text),
        sessionId: String(sessionId),
        setDraft: (text) => { conversation.input.for(actx).actions.setDraft(text) },
        notify: (level, text) => { conversation.input.for(actx).notify(level, text) },
        // 冻结期间 raise composer block：composer 变 inert（回车/发送按钮全部失效），
        // 输入不会漏进对话；恢复时清除。block 不锁 input.right（恢复按钮仍可点）。
        setComposerBlock: (reason) => {
          conversation.blocks.set(sessionId, reason === undefined ? undefined : { reason })
        },
      }
    },
  }, FreezeButton))

  // Hide the official busy-Enter settings row (null render wins the cell).
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'composer-enter',
    order: 20,
    priority: -1,
    locale: NS,
  }, HideEnterRow))
}
