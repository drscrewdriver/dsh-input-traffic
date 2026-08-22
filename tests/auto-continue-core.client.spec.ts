/**
 * auto-continue-core 单元测试: 错误分类 / 自适应退避 / 模板填充 / 幂等护栏 /
 * 配置解析。这些纯函数吸收自 dsh-auto-continue core.ts(见模块头来源标注)。
 */
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONFIG,
  effectiveCooldown,
  fillTemplate,
  formatElapsed,
  isTransientAgentError,
  isTransientFailure,
  resolveConfig,
  toolResultFacts,
} from '../src/client/auto-continue-core.ts'

describe('isTransientFailure', () => {
  it('treats network / 5xx / 429 as transient', () => {
    expect(isTransientFailure({ message: 'socket hang up' })).toBe(true)
    expect(isTransientFailure({ code: 'UPSTREAM', message: 'upstream error' })).toBe(true)
    expect(isTransientFailure({ message: 'server error', status: 502 })).toBe(true)
    expect(isTransientFailure({ code: 'RATE_LIMIT_EXCEEDED', message: 'too many', status: 429 })).toBe(true)
  })

  it('treats auth / balance / model / context as permanent', () => {
    expect(isTransientFailure({ message: 'invalid api key', status: 401 })).toBe(false)
    expect(isTransientFailure({ message: 'forbidden', status: 403 })).toBe(false)
    expect(isTransientFailure({ message: 'insufficient balance' })).toBe(false)
    expect(isTransientFailure({ message: 'model not found' })).toBe(false)
    expect(isTransientFailure({ message: 'context length exceeded' })).toBe(false)
  })
})

describe('isTransientAgentError', () => {
  it('matches network / timeout / upstream / 5xx / 429 only', () => {
    expect(isTransientAgentError('network error')).toBe(true)
    expect(isTransientAgentError('ETIMEDOUT after 30s')).toBe(true)
    expect(isTransientAgentError('upstream temporarily unavailable')).toBe(true)
    expect(isTransientAgentError('HTTP 503')).toBe(true)
    expect(isTransientAgentError('HTTP 429')).toBe(true)
    expect(isTransientAgentError('serialization failed')).toBe(false)
    expect(isTransientAgentError('invalid config')).toBe(false)
  })
})

describe('effectiveCooldown', () => {
  it('back-offs multiplicatively then caps', () => {
    expect(effectiveCooldown(0, 20000, 2, 300000)).toBe(20000)
    expect(effectiveCooldown(1, 20000, 2, 300000)).toBe(40000)
    expect(effectiveCooldown(2, 20000, 2, 300000)).toBe(80000)
    // 超过上限时封顶
    expect(effectiveCooldown(10, 20000, 2, 300000)).toBe(300000)
  })
})

describe('formatElapsed', () => {
  it('renders ms / s / m-s forms and guards non-finite', () => {
    expect(formatElapsed(500)).toBe('500ms')
    expect(formatElapsed(5000)).toBe('5s')
    expect(formatElapsed(65000)).toBe('1m5s')
    expect(formatElapsed(undefined)).toBe('')
    expect(formatElapsed(-1)).toBe('')
  })
})

describe('fillTemplate', () => {
  it('replaces supported placeholders and leaves unknown ones', () => {
    const out = fillTemplate('继续 ({tool}: {code} {status}) 等 {elapsed}', {
      tool: 'git push',
      facts: { code: 'UPSTREAM', status: 502 },
      elapsedMs: 65000,
    })
    expect(out).toBe('继续 (git push: UPSTREAM 502) 等 1m5s')
  })
})

describe('toolResultFacts', () => {
  it('flags isError / error payload as failed and extracts text excerpt', () => {
    const failed = toolResultFacts({ message: { content: [{ type: 'text', content: [{ type: 'text', text: 'boom' }], isError: true }] } })
    expect(failed.ok).toBe(false)
    expect(failed.excerpt).toBe('boom')
    const ok = toolResultFacts({ message: { content: [{ type: 'text', content: [{ type: 'text', text: 'done' }] }] } })
    expect(ok.ok).toBe(true)
    expect(ok.excerpt).toBe('done')
  })
})

describe('resolveConfig', () => {
  it('falls back to defaults for missing / invalid fields', () => {
    const resolved = resolveConfig(undefined)
    expect(resolved).toEqual(DEFAULT_CONFIG)
    const partial = resolveConfig({ maxConsecutive: 0, backoffFactor: 0, paused: true, continueText: '  ' })
    expect(partial.maxConsecutive).toBe(1)
    expect(partial.backoffFactor).toBe(1)
    expect(partial.paused).toBe(true)
    expect(partial.continueText).toBe(DEFAULT_CONFIG.continueText)
  })
})
