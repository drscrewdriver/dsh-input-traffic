/**
 * Auto-continue store — 中断检测与续跑配置的共享状态。
 *
 * 与 freeze-store 同构(无运行时依赖、稳定 identity per mount、可测试):
 * - interrupted: 检测到「会话停下但排队消息未处理完」(疑似非人为中断)时置位,
 *   dock 据此显示续跑提示条;
 * - 续跑配置持久化到 localStorage(键 `dsh-input-traffic:auto-continue`),
 *   自动续跑默认关闭(纯 client 拿不到 turn/end reason, 无法与用户主动停止
 *   区分, 故默认只提示、不擅自续跑)。
 */
import { resolveConfig, type AutoContinueConfig, type AutoContinueSettings } from './auto-continue-core.ts'

/** localStorage 持久化键(续跑配置)。 */
export const CONFIG_KEY = 'dsh-input-traffic:auto-continue'

export interface AutoContinueState {
  /** 是否检测到疑似中断(提示条可见性)。 */
  interrupted: boolean
  /** 连续自动续跑次数(按配置上限封顶)。 */
  consecutive: number
  /** 上次续跑尝试时间戳(退避节流用)。 */
  lastAttemptAt: number
}

const listeners = new Set<() => void>()
let state: AutoContinueState = { interrupted: false, consecutive: 0, lastAttemptAt: 0 }
let config: AutoContinueConfig = readConfig()

/** 读取(可能不完整的)localStorage 配置并解析为完整配置。 */
function readConfig(): AutoContinueConfig {
  let raw: AutoContinueSettings | undefined
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (stored !== null) raw = JSON.parse(stored) as AutoContinueSettings
  } catch {
    /* storage 不可用或损坏: 回落默认 */
  }
  return resolveConfig(raw)
}

function emit(): void {
  for (const listener of listeners) listener()
}

/** 最小快照 store(与 freeze-store 同构)。 */
export const autoContinueStore = {
  getSnapshot(): AutoContinueState {
    return state
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}

/** 当前解析后的续跑配置。 */
export function readAutoContinueConfig(): AutoContinueConfig {
  return config
}

/** 持久化续跑配置(部分覆盖, 缺失回落默认)。 */
export function setAutoContinueConfig(patch: AutoContinueSettings): void {
  config = resolveConfig({ ...config, ...patch })
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    /* storage 不可用: 仅内存生效 */
  }
  // 强制快照引用变化: useSyncExternalStore 依赖引用对比决定是否重渲染。
  state = { ...state }
  emit()
}

/** 标记检测到疑似中断(dock 显示提示条)。 */
export function markInterrupted(): void {
  state = { ...state, interrupted: true }
  emit()
}

/** 清除中断标志(用户手动续跑 / 队列清空 / 会话重新运行)。 */
export function clearInterrupted(): void {
  state = { ...state, interrupted: false }
  emit()
}

/** 记录一次续跑尝试(推进连续计数与退避节流)。 */
export function noteRetry(consecutive: number): void {
  state = { ...state, consecutive, lastAttemptAt: Date.now() }
  emit()
}

/** 重置续跑状态(成功回合 / 用户介入后)。 */
export function resetAutoContinue(): void {
  state = { interrupted: false, consecutive: 0, lastAttemptAt: 0 }
  emit()
}

/** 测试重置。 */
export function resetAutoContinueStore(): void {
  state = { interrupted: false, consecutive: 0, lastAttemptAt: 0 }
  try {
    localStorage.removeItem(CONFIG_KEY)
  } catch {
    /* storage 不可用 */
  }
  config = readConfig()
  emit()
}
