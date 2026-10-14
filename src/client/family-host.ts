/**
 * 家族容器兜底接管（family host backstop）。
 *
 * 为什么需要：本插件把设置卡挂在 `dsh-family.tab` 上，而那个子席位由**别的插件**
 * （thinking-levels / session-guard / session-steward / dsh-mcp-registry）声明。
 * 宿主的规则是「注册未声明的槽直接抛」，且声明全局唯一、先到先得——所以只要那几家
 * 全部让位或声明失败，本插件的设置面就整轮启动不可见，而且**不报任何错**
 * （inject 工厂在槽未声明时压根不跑）。
 *
 * 本模块把"看不见"变成"自己上位"：延迟到分级时刻检查**自己的 tab 工厂有没有被跑过**
 * ——那是插件侧唯一合法的「有人声明了吗」探针（宿主只在声明成立后才执行工厂）。
 * 没跑过 → 自己注册一个通用容器，声明子席位，按账本渲染所有贡献卡（含自己的）。
 *
 * declare-or-withdraw：声明子席位失败（别人已持有）时**绝不**退回不带 children 的
 * 裸注册——残废容器会占住导航行、让后来者按「已有 dsh-family」集体退场，
 * 这正是 2026-10-14 家族面板丢失的成因。
 */
import { createElement, useEffect, useState } from 'react'
import type { JSX, ReactNode } from 'react'

/** 账本条目（id/order/label，label 已解析成字符串）。 */
export interface FamilyTabEntry {
  id: string
  order: number
  label: string
}

/** 只用到槽门面的这几件事，避免与 index.tsx 的类型互相拖累。 */
export interface FamilyHostSlots {
  inject: (name: string, factory: () => unknown) => unknown
  register: (options: Record<string, unknown>, component: unknown) => unknown
  entries: (name: string) => readonly Record<string, unknown>[]
  subscribe?: (name: string, fn: () => void) => () => void
}

/** 家族节固定 id 与子席位 key（与 thinking-levels 的声明严格一致）。 */
const FAMILY_SECTION_ID = 'dsh-family'
const FAMILY_CHILD_KEY = 'dsh-family.tab'

/**
 * 接管分级——唯一真源是 `mine-dsh-plugins/_tools/family-rank.mjs`（离线实测 GitHub
 * star + npm 周下载量加权）。延迟 = BASE + RANK * STEP；rank 越大越靠后兜底。
 */
export const FAMILY_CLAIM_RANK = 2
const FAMILY_CLAIM_BASE_MS = 200
const FAMILY_CLAIM_STEP_MS = 900
/** 派生而非硬编码：改 rank 表就自动改时刻。 */
export const FAMILY_CLAIM_DELAY_MS = FAMILY_CLAIM_BASE_MS + FAMILY_CLAIM_RANK * FAMILY_CLAIM_STEP_MS

/** 接管行的遮蔽优先级：必须大于任何正牌 owner（TL 无=0、guard=10），
 * 这样 owner 一旦上位就自然遮蔽本兜底行（宿主规则：同 cell 最低者渲染）。 */
const FAMILY_HOST_PRIORITY = 50

type HostObservable<T> = {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/** 账本条目上宿主挂的直挂载面（≤0.1.5 壳无 renderSlot 时用）。 */
interface MountableEntry {
  options?: Record<string, unknown>
  component?: unknown
  inject?: unknown
}

export interface FamilyHostSectionProps {
  renderSlot?: (key: 'dsh-family.tab', owner?: object, opts?: { only?: string; fallback?: JSX.Element | null }) => JSX.Element | null
  useTabs?: <S>(selector: (value: readonly FamilyTabEntry[]) => S) => S
  hooks?: { tabs: HostObservable<readonly FamilyTabEntry[]> }
  renderContributor?: (id: string) => JSX.Element | null
}

const NO_TABS: readonly FamilyTabEntry[] = []

/** 通用容器渲染：按 order 依次画出账本里每张贡献卡，不含任何"本插件特例"。 */
export function FamilyHostSection(props: FamilyHostSectionProps): JSX.Element {
  const raw = props.hooks?.tabs
  const [polled, setPolled] = useState<readonly FamilyTabEntry[]>(() => raw?.getSnapshot() ?? NO_TABS)
  useEffect(() => {
    if (props.useTabs !== undefined || raw === undefined) return
    return raw.subscribe(() => setPolled(raw.getSnapshot()))
  })
  const tabs = props.useTabs !== undefined ? props.useTabs(value => value) : polled
  return createElement(
    'div',
    { style: { display: 'grid', gap: '12px' } },
    tabs.map(row =>
      createElement(
        'div',
        { key: row.id },
        props.renderSlot
          ? props.renderSlot(FAMILY_CHILD_KEY, {}, { only: row.id, fallback: null })
          : props.renderContributor?.(row.id) ?? null,
      ),
    ),
  )
}

/** 取条目上的具名面（宿主条目是结构化对象，这里只做安全读取）。 */
function face(entry: unknown, key: string): unknown {
  if (entry === null || typeof entry !== 'object') return undefined
  return (entry as Record<string, unknown>)[key]
}

/** 条目的 options 收窄（宿主侧是结构化对象，缺失时当空对象读）。 */
function optionsOf(entry: unknown): Record<string, unknown> {
  const raw = face(entry, 'options')
  return raw !== null && typeof raw === 'object' ? raw as Record<string, unknown> : {}
}

/** 把账本条目投影成标题行：label 可能是函数，抛错退化成 id，绝不带崩整节。 */
export function projectLedger(slots: FamilyHostSlots): readonly FamilyTabEntry[] {
  return slots
    .entries(FAMILY_CHILD_KEY)
    .map(rawEntry => {
      const entry = rawEntry as unknown as MountableEntry
      const options = entry.options ?? {}
      const id = String(options['id'] ?? '')
      const rawLabel = options['label']
      let label = id
      if (typeof rawLabel === 'function') {
        try {
          label = String((rawLabel as () => unknown)() ?? id)
        } catch {
          label = id
        }
      } else if (typeof rawLabel === 'string') {
        label = rawLabel
      }
      return { id, order: Number(options['order'] ?? 0), label }
    })
    .sort((a, b) => a.order - b.order)
}

/**
 * 若到点仍无人声明子席位，则自己接管容器。
 * @param slots - 客户端槽门面。
 * @param isHeld - 探针：本插件的 tab 工厂是否已被执行（= 有人声明了子席位）。
 * @param label - 导航标题；家族共享节的标题，不是本插件名。
 * @param log - console 前缀（带插件名）。
 * @returns 取消定时器与撤销接管注册的 disposer。
 */
export function claimFamilyHostIfOrphaned(
  slots: FamilyHostSlots,
  isHeld: () => boolean,
  label: () => string,
  log: string,
): () => void {
  let disposeClaim: (() => void) | undefined
  let claimed = false
  const timer = setTimeout(() => {
    // 有人持有声明（我们的工厂被跑过）或账本已有卡 → 只做成员，不上位。
    if (isHeld()) return
    const ledger: HostObservable<readonly FamilyTabEntry[]> = {
      getSnapshot: () => projectLedger(slots),
      subscribe: listener => (slots.subscribe ? slots.subscribe(FAMILY_CHILD_KEY, listener) : () => undefined),
    }
    /** ≤0.1.5 壳没有 renderSlot：从账本条目现挂组件，失败一律 null。 */
    const renderContributor = (id: string): JSX.Element | null => {
      try {
        const found = slots.entries(FAMILY_CHILD_KEY).find(candidate => String(optionsOf(candidate)['id'] ?? '') === id)
        const entry = found as unknown as MountableEntry | undefined
        const component = entry ? face(entry, 'component') : undefined
        const inject = entry ? face(entry, 'inject') : undefined
        if (typeof component !== 'function') return null
        const injected = typeof inject === 'function' ? (inject as () => Record<string, unknown>)() : {}
        return createElement(component as (props: unknown) => ReactNode, injected ?? {}) as JSX.Element
      } catch {
        return null
      }
    }
    try {
      const dispose = slots.register(
        {
          name: 'settings.section',
          id: FAMILY_SECTION_ID,
          order: 40,
          priority: FAMILY_HOST_PRIORITY,
          label,
          inject: () => ({ hooks: { tabs: ledger }, renderContributor }),
          children: { [FAMILY_CHILD_KEY]: { kind: 'list', scope: 'root' } },
        },
        FamilyHostSection,
      )
      if (typeof dispose === 'function') disposeClaim = dispose as () => void
      claimed = true
      console.warn(`${log} family container unclaimed — took it over (children declared)`)
    } catch (error) {
      // declare-or-withdraw: someone holds the declaration after all; a childless
      // section here would hide every member card instead of saving it.
      console.warn(`${log} family claim lost — withdrawing (${error instanceof Error ? error.message : String(error)})`)
    }
  }, FAMILY_CLAIM_DELAY_MS)
  return () => {
    clearTimeout(timer)
    if (claimed) disposeClaim?.()
  }
}
