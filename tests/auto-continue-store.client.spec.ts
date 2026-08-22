/**
 * auto-continue-store 测试: 中断标记、配置持久化与重置。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  autoContinueStore,
  clearInterrupted,
  markInterrupted,
  noteRetry,
  readAutoContinueConfig,
  resetAutoContinue,
  resetAutoContinueStore,
  setAutoContinueConfig,
} from '../src/client/auto-continue-store.ts'
import { DEFAULT_CONFIG } from '../src/client/auto-continue-core.ts'

beforeEach(() => {
  resetAutoContinueStore()
})

describe('autoContinueStore', () => {
  it('starts clean and marks/clears interrupted', () => {
    expect(autoContinueStore.getSnapshot()).toEqual({ interrupted: false, consecutive: 0, lastAttemptAt: 0 })
    markInterrupted()
    expect(autoContinueStore.getSnapshot().interrupted).toBe(true)
    clearInterrupted()
    expect(autoContinueStore.getSnapshot().interrupted).toBe(false)
  })

  it('tracks consecutive retries and resets', () => {
    noteRetry(1)
    noteRetry(2)
    expect(autoContinueStore.getSnapshot().consecutive).toBe(2)
    resetAutoContinue()
    expect(autoContinueStore.getSnapshot().consecutive).toBe(0)
  })

  it('persists config overrides and falls back to defaults', () => {
    expect(readAutoContinueConfig()).toEqual(DEFAULT_CONFIG)
    setAutoContinueConfig({ maxConsecutive: 5, paused: true, autoResume: true })
    expect(readAutoContinueConfig().maxConsecutive).toBe(5)
    expect(readAutoContinueConfig().paused).toBe(true)
    expect(readAutoContinueConfig().autoResume).toBe(true)
    // 非法值回落
    setAutoContinueConfig({ maxConsecutive: 0 })
    expect(readAutoContinueConfig().maxConsecutive).toBe(1)
    // 未覆盖字段保持默认
    expect(readAutoContinueConfig().graceMs).toBe(DEFAULT_CONFIG.graceMs)
  })
})
