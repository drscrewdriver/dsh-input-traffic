/**
 * 输入流量 —— 「起子插件设置」family tab 的只读状态卡。
 *
 * 本插件是纯 client 接管型：没有自有 Config，busyEnter 在 apply 时钉死为
 * `queue`（写 ui-conversation entry），官方 General 行同时被压掉。因此这张卡
 * **只读**：展示钉死状态与使用说明，不提供任何写入口——提供 busyEnter 切换
 * 会与接管设计（apply 重新钉死）打架。
 *
 * 数据面：`configForms.get('ui-conversation')` 的快照（跨 entry 读，宿主
 * describe 镜像对该 entry 本就服务——官方 Enter 行就是它的编辑器）。
 */
import { createElement, useSyncExternalStore, type CSSProperties, type JSX } from 'react'

/** 只读快照面（configForms 原生句柄的结构化子集）。 */
export interface FamilyCardScope {
  getSnapshot(): { status: string; value: { busyEnter?: string } | undefined; writable: boolean }
  subscribe(listener: () => void): () => void
}

export interface FamilyCardProps {
  /** 活引用：≤0.1.5 settingsScope 永不 resolve 时保持 undefined（降级渲染）。 */
  scope?: FamilyCardScope
  t?: (key: string, params?: Record<string, unknown>) => string
}

const row: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0', fontSize: 13 }
const label: CSSProperties = { color: 'var(--dsw-alias-label-primary, inherit)' }
const dim: CSSProperties = { color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,.8))', fontSize: 12, lineHeight: 1.5 }

/** 无 scope 时的降级快照（模块级常量：useSyncExternalStore 要求稳定引用）。 */
const DEGRADED_SNAPSHOT = { status: 'unavailable', value: undefined, writable: false }

export function InputTrafficFamilyCard({ scope, t }: FamilyCardProps): JSX.Element {
  // hooks 无条件调用（rules-of-hooks）：无 scope 时订阅为 no-op、快照取模块级
  // 降级常量；scope 缺席与否在挂载期内是稳定的（双轨后 scope 恒有，本分支只
  // 是防御位），不会触发 hook 序翻转。
  const snapshot = useSyncExternalStore(
    (listener) => scope?.subscribe(listener) ?? (() => {}),
    () => scope?.getSnapshot() ?? DEGRADED_SNAPSHOT,
  )
  const tr = (key: string): string => (t ? t(key) : FALLBACK_ZH[key] ?? key)
  // scope 缺席（防御位，双轨后常态不可达）的降级态：卡仍在账本里
  // （导航/接管节可见），数据缺席呈现不可用说明而不是崩/空白。
  if (!scope) {
    return createElement('div', { style: { display: 'grid', gap: 6 } },
      createElement('p', { style: { ...dim, margin: 0 } }, `${tr('family.desc')}（当前宿主设置服务不可用 — 只读）`),
    )
  }
  const pinned = snapshot.value?.busyEnter ?? 'queue'
  return createElement('div', { style: { display: 'grid', gap: 6 } },
    createElement('div', { style: row },
      createElement('span', { style: label }, tr('family.busyEnter')),
      createElement('span', { style: dim }, `busyEnter = ${pinned}`),
    ),
    createElement('p', { style: { ...dim, margin: 0 } }, tr('family.desc')),
  )
}

/** 无 locale 服务时的中文兜底（与 zh 字典键一一对应）。 */
const FALLBACK_ZH: Record<string, string> = {
  'family.busyEnter': 'busy-Enter 行为（本插件接管）',
  'family.desc': '普通回车在繁忙时进入排队（queue），不会打断当前回答；打断请用输入区的冻结/转向按钮。该行为由本插件自动接管，无需配置。',
}
