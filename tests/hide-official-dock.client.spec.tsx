/**
 * 官方队列条的隐藏规则必须用**哈希无关**的钩子（issue #5 次生缺陷 3）。
 *
 * 历史：规则原本只有 `[class*="_7yHdaG_dock"]` —— 一个 css-module 哈希。
 * 宿主重建后模块被重哈希，该选择器在 0.2.2-rc.3 的 `app.asar` 里出现 **0 次**
 * （实测：`_7yHdaG` count = 0，同模块已变成 `F07MqG_dock`）。规则成空 →
 * 插件 dock 崩溃回落时官方 QueueDock 不再被隐藏，它的逐行「插话发送」与
 * 我们自己的黄色档重复。
 *
 * 这里钉的是「主规则必须是宿主自己的稳定属性」，哈希规则只能当老宿主兜底。
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const DOCK = readFileSync(join(ROOT, 'src', 'client', 'steer-queue-dock.tsx'), 'utf8')

describe('官方队列条的隐藏规则', () => {
  it('主规则用宿主的 data-queue-dock 属性（哈希无关）', () => {
    expect(DOCK).toContain('[data-queue-dock]')
  })

  it('data-queue-dock 规则带 !important（否则被宿主同层级的 display 规则盖掉）', () => {
    const rule = /\[data-queue-dock\]\{[^}]*\}/.exec(DOCK)
    expect(rule, 'data-queue-dock 规则必须存在').not.toBeNull()
    expect(rule?.[0]).toContain('display:none!important')
  })

  it('哈希规则仍在，作为老宿主兜底', () => {
    // 不能删：0.2.2-rc.3 之前的宿主没有 data-queue-dock，只有哈希类。
    expect(DOCK).toContain('[class*="_7yHdaG_dock"]')
  })

  it('不得用 aria-label 兜底（官方插话按钮与我们黄色档同标签，会误伤自己）', () => {
    const cssBlock = DOCK.slice(DOCK.indexOf('HIDE_OFFICIAL_QUEUE_CSS'), DOCK.indexOf('if (typeof document'))
    expect(cssBlock).not.toMatch(/aria-label|插话发送/)
  })
})
