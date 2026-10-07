/**
 * compat.ts —— 版本敏感代码的**唯一窄腰**（INDEX §C：版本差异代码只许出现在
 * 窄腰文件，能力探测优先，禁止读宿主版本号）。
 *
 * 本插件已核实的两处分叉（findings §1.1 #5 / 迁移执行期补勘）：
 * 1. 持久化设置面：0.1.7+ 走 `configForms.get(ns)`；≤0.1.5 走
 *    `settingsScope.bind({ namespace })`。0.1.7-rc.1 的 client-ui-settings 包
 *    已不含 `settingsScope` 字样（2026-10-04 node_modules 全文核查）——两服务
 *    按代互斥，双 scoped-inject 天然不会双触发。
 * 2. 草稿回填：≤0.1.5 在 `input.for(actx).actions.setDraft`，0.1.7+ 直挂
 *    `.setDraft`（compat/0.1.5:src/client/index.ts vs 本分支同文件）。
 *
 * 缺席服务上的 scoped-inject fiber 永久 PENDING：与 `dsh-family.tab` 在持有者
 * （跨插件族，非宿主本体）缺席时的惰性等待同型，不阻塞插件其余半区——
 * 插件级 inject 清单因此**只含六线通用服务**，防整插件 PENDING 静默失活。
 *
 * All @deepseek-ai/* imports are type-only (client bundle purity).
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'

/**
 * Structural minimum of a durable settings document handle — shared by
 * `configForms.get()` (0.1.7+) and `settingsScope.bind()` (≤0.1.5). Declared
 * locally (NOT as ambient augmentation of `@deepseek-ai/dsh-client-ui-settings/client`)
 * so the compile face stays identical against every host line's real types.
 */
export interface SettingsDocHandle {
  getSnapshot(): { status: string; value: { busyEnter?: string } | undefined; writable: boolean }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
}

/** Anything registerSettingsFaces needs beyond the pin itself. */
export interface SettingsFacesDeps {
  /** Durable namespace holding the pinned field (`ui-conversation`). */
  namespace: string
  /** Field to pin (busy-Enter takeover). */
  field: string
  /** Value to pin. */
  value: unknown
  /** Called once a settings face resolves; receives the scope handle (the
   * family tab card reads it). Never called on hosts with neither service. */
  onScope: (scope: SettingsDocHandle) => void
}

/**
 * Pin the busy-Enter field through whichever durable-settings service this
 * host line carries, then hand the resolved scope to `onScope`.
 *
 * Both variants are scoped sub-injects: on a host without the service the
 * fiber waits forever WITHOUT blocking the plugin's other faces (same posture
 * as the family tab's slot-inject when the family holder is absent).
 */
export function registerSettingsFaces(ctx: ClientContext, deps: SettingsFacesDeps): void {
  // cordis inject 回调收到的是 (ctx, config)——服务要按名从 scope 对象上读
  // （thinking-levels 腰的同款形态；0.7.1 曾把参数当裸服务 .get/.bind 调用，
  // 每一代宿主上都是 TypeError，纤维暗死 → onScope 永不回调 → 卡永远降级）。
  const scopeInject = (ctx as unknown as {
    inject: (deps: string[], cb: (scope: Record<string, unknown>) => void) => void
  }).inject
  // Modern hosts (0.1.7+): configForms owns cross-entry durable writes.
  scopeInject(['configForms'], (scope) => {
    const forms = scope.configForms as { get(namespace: string): SettingsDocHandle } | undefined
    if (forms === undefined) return
    const handle = forms.get(deps.namespace)
    void handle.set(deps.field, deps.value)
    deps.onScope(handle)
  })
  // Old hosts (≤0.1.5): namespaced durable scope via bind().
  scopeInject(['settingsScope'], (scope) => {
    const settingsScope = scope.settingsScope as
      | { bind(spec: { namespace: string }): SettingsDocHandle }
      | undefined
    if (settingsScope === undefined) return
    const handle = settingsScope.bind({ namespace: deps.namespace })
    void handle.set(deps.field, deps.value)
    deps.onScope(handle)
  })
}

/**
 * Draft back-fill normalized across host lines: prefers the direct
 * `.setDraft` (0.1.7+), falls back to the `.actions` parking spot (≤0.1.5).
 * Pure shape probing on the conversation row object — no version reads.
 */
export function draftWriter(
  conversation: { input: { for(actx: unknown): unknown } },
  actx: unknown,
): (text: string) => void {
  return (text: string) => {
    const row = conversation.input.for(actx) as {
      setDraft?(text: string): void
      actions?: { setDraft(text: string): void }
    }
    if (typeof row.setDraft === 'function') row.setDraft(text)
    else row.actions?.setDraft(text)
  }
}
