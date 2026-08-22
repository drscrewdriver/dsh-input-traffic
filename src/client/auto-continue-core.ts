/**
 * Auto-continue core — 平台无关的纯逻辑, 吸收自 dsh-auto-continue
 * (https://github.com/HsiangNianian/dsh-auto-continue, MIT, v0.8.1 的
 * src/shared/core.ts), 按 input-traffic 的纯 client 定位裁剪:
 *
 * - 只吸收「错误分类 / 自适应退避 / 幂等护栏 / 模板填充」这些无宿主依赖的纯函数;
 * - 不吸收宿主引擎(host firehose / agent.followup / SSE 桥)——那会破坏本插件
 *   「纯浏览器侧、不改官方源码」的定位, 且与「冻结会话省钱」方向相反(见 README 兼容性);
 * - 全部函数无任何 @deepseek-ai/* 值导入, 通过 client bundle purity gate。
 *
 * 应用场景: dock 的「续跑」——检测到会话停下但排队消息未处理完(疑似中断)时,
 * 分类失败、按退避节奏重发, 永久性错误则停止并提示人工介入。
 */

/** 一次发送失败的可分类事实(从 send 的 reject error 里提取)。 */
export interface FailureFacts {
  /** 稳定机器路由码(如 UPSTREAM、RATE_LIMIT_EXCEEDED)。 */
  code?: string
  /** 人类可读的失败描述。 */
  message: string
  /** 供应商 HTTP 状态码(可用时)。 */
  status?: number
}

/**
 * 错误分类: 该失败是否值得重试续跑。
 * 永久性失败(认证/余额/模型不存在/上下文超限等)重试也不会成功, 应停止并提示用户;
 * 其余(网络、超时、5xx、429 等)视为临时性失败, 允许自动重发。
 */
export function isTransientFailure(failure: FailureFacts): boolean {
  const haystack = `${failure.code ?? ''} ${failure.message}`.toLowerCase()
  const status = failure.status
  if (status !== undefined && (status === 401 || status === 403)) return false
  const permanent =
    /auth|unauthor|forbidden|credential|api[_-]?key|permission/i.test(haystack) ||
    /insufficient.*(balance|quota)|billing|payment|quota.*exceeded.*(?!retry)/i.test(haystack) ||
    /model[^a-z]*not[^a-z]*found|unknown[_-]?model|not.*support.*model/i.test(haystack) ||
    /context.*(length|limit|overflow|exceed)|token.*limit|max.*context/i.test(haystack) ||
    /invalid[_-]?request|bad[_-]?request/i.test(haystack)
  return !permanent
}

/**
 * 消息文本分类: 仅明确属于网络/传输类的临时错误才值得重试。
 * 其余(序列化失败、配置/宿主内部错误等)视为永久性——重试无益。
 */
export function isTransientAgentError(message: string): boolean {
  return /network|timeout|timed ?out|econn|etimedout|socket|5\d\d|\b429\b|upstream|temporar/i.test(message)
}

/** 自适应退避: 同一会话连续失败时的有效重试间隔。 */
export function effectiveCooldown(
  consecutive: number,
  base: number,
  factor: number,
  max: number,
): number {
  // consecutive = 已连续自动重发的次数; 第 1 次后开始按 factor 递增
  const multiplier = Math.pow(factor, consecutive)
  return Math.min(Math.max(base, base * multiplier), Math.max(base, max))
}

/** 模板填充所需上下文(全部可选, 缺失的占位符填为空串)。 */
export interface TemplateContext {
  /** 失败事实(错误码/消息/HTTP 状态), 对应 {code}/{message}/{status}。 */
  facts?: FailureFacts
  /** 失败前最后一次工具调用的名称, 对应 {tool}。 */
  tool?: string
  /** 连续失败次数(含本次), 对应 {errorCount}。 */
  errorCount?: number
  /** 自失败发生以来的毫秒数, 对应 {elapsed}。 */
  elapsedMs?: number
  /** 上一步工具结果摘要(截断), 对应 {result}(护栏模板用)。 */
  result?: string
}

/** 把毫秒格式化为人类可读的经过时长(如 65s → 1m5s)。 */
export function formatElapsed(ms: number | undefined): string {
  if (ms === undefined || !Number.isFinite(ms) || ms < 0) return ''
  if (ms < 1000) return `${Math.round(ms)}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60 > 0 ? `${s % 60}s` : ''}`
}

/** 用失败事实填充续跑模板占位符({code}/{message}/{status}/{tool}/{errorCount}/{elapsed}/{result})。 */
export function fillTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replace(/\{code\}/g, ctx.facts?.code ?? '')
    .replace(/\{message\}/g, ctx.facts?.message ?? '')
    .replace(/\{status\}/g, ctx.facts?.status !== undefined ? String(ctx.facts.status) : '')
    .replace(/\{tool\}/g, ctx.tool ?? '')
    .replace(/\{errorCount\}/g, ctx.errorCount !== undefined ? String(ctx.errorCount) : '')
    .replace(/\{elapsed\}/g, formatElapsed(ctx.elapsedMs))
    .replace(/\{result\}/g, ctx.result ?? '')
}

/** 工具结果摘要的最大长度(护栏模板 {result} 用)。 */
const TOOL_RESULT_CAP = 160

/** 从任意内容块里递归收集文本(结果为模型可见的工具输出)。 */
function extractText(blocks: unknown, cap: number): string {
  let out = ''
  const walk = (value: unknown): void => {
    if (out.length >= cap) return
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    if (typeof value !== 'object' || value === null) return
    const record = value as Record<string, unknown>
    if (record['type'] === 'text' && typeof record['text'] === 'string') {
      out += record['text']
      return
    }
    for (const child of Object.values(record)) walk(child)
  }
  walk(blocks)
  return out.slice(0, cap)
}

/** 上一步工具调用的判定结果: 是否已确认完成, 以及文本摘要。 */
export interface ToolResultFacts {
  /** 工具是否成功完成(内部失败或 isError 视为未成功)。 */
  ok: boolean
  /** 工具输出的文本摘要(截断)。 */
  excerpt: string
}

/** 从 tool/result 事件载荷提取成功与否与文本摘要(幂等护栏: 续跑时提示别重复执行)。 */
export function toolResultFacts(data: {
  error?: { name?: string; code?: string }
  message?: { content?: Array<{ type?: string; content?: unknown; isError?: boolean }> }
}): ToolResultFacts {
  const failed = data.error !== undefined || data.message?.content?.[0]?.isError === true
  return { ok: !failed, excerpt: extractText(data.message?.content?.[0]?.content, TOOL_RESULT_CAP) }
}

/** 续跑配置(全部可选, 解析时回落默认值)。 */
export interface AutoContinueSettings {
  /** 续跑时自动发送的消息文本(可含模板占位符)。 */
  continueText?: string
  /** 宽限期: 停下多久后视为中断再自动重发(ms)。 */
  graceMs?: number
  /** 同一会话两次自动续跑的最小间隔(ms)。 */
  cooldownMs?: number
  /** 连续自动续跑上限; 超过后停止, 直到用户介入或成功回合。 */
  maxConsecutive?: number
  /** 连续失败时的退避系数。 */
  backoffFactor?: number
  /** 自适应退避的上限(ms)。 */
  backoffMaxMs?: number
  /**
   * 自动续跑: 检测到疑似中断时自动重发排队消息。
   * 默认关闭——纯 client 拿不到 turn/end reason, 无法区分「用户主动停止」与
   * 「非人为中断」, 故默认只提示不擅自续跑(与 auto-continue 的 paused 不同)。
   */
  autoResume?: boolean
  /** 全局暂停续跑(如冻结期间)。 */
  paused?: boolean
}

/** 完全解析后的续跑配置(内置默认值 + 用户覆盖)。 */
export type AutoContinueConfig = Required<AutoContinueSettings>

/** 内置默认值(与 dock 的 localStorage 持久化键一致)。 */
export const DEFAULT_CONFIG: AutoContinueConfig = {
  continueText: '继续',
  graceMs: 3000,
  cooldownMs: 20000,
  maxConsecutive: 3,
  backoffFactor: 2,
  backoffMaxMs: 300000,
  autoResume: false,
  paused: false,
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

/** 把(可能不完整的)配置解析为完整配置(合法数字/布尔校验 + 兜底默认)。 */
export function resolveConfig(section: AutoContinueSettings | undefined): AutoContinueConfig {
  const value = section ?? {}
  const text =
    typeof value.continueText === 'string' && value.continueText.trim() !== ''
      ? value.continueText
      : DEFAULT_CONFIG.continueText
  return {
    continueText: text,
    graceMs: numberOr(value.graceMs, DEFAULT_CONFIG.graceMs),
    cooldownMs: numberOr(value.cooldownMs, DEFAULT_CONFIG.cooldownMs),
    maxConsecutive: Math.max(1, numberOr(value.maxConsecutive, DEFAULT_CONFIG.maxConsecutive)),
    backoffFactor: Math.max(1, numberOr(value.backoffFactor, DEFAULT_CONFIG.backoffFactor)),
    backoffMaxMs: numberOr(value.backoffMaxMs, DEFAULT_CONFIG.backoffMaxMs),
    autoResume: booleanOr(value.autoResume, DEFAULT_CONFIG.autoResume),
    paused: booleanOr(value.paused, DEFAULT_CONFIG.paused),
  }
}
