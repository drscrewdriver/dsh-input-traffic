/**
 * scan-slot-registrations.mjs —— 宿主树槽位存在性扫描（INDEX §D.4 的
 * input-traffic 形态）。
 *
 * 与 tidy-display 原型（TS AST 提取注册表）的偏差：本插件四个槽位全走
 * **遮蔽语义**，运行时按**精确名**匹配——所以断言只需「名字字面量在该版本
 * 宿主树中在位」，不需要注册调用点的结构提取。改名/移槽在此语义下是静默
 * 失效（09 指导 §4.5 头号风险），本扫描器就是矩阵里对它的机器门禁。
 *
 * 三参数化（INDEX §D.4）：
 *   ① 槽位名单 —— 内置本插件四名；--pattern 可换前缀正则（发现模式）。
 *   ② 宿主源码根 —— argv[2]，矩阵内传沙箱安装目录（扫其 node_modules/@deepseek-ai）。
 *   ③ 基线路径 —— --baseline <file>：与 compat/<host-version>.json 比对，有出入 exit 1。
 *
 * Windows 修复（tidy-display 原型教训，必须原样保留）：rg 必须
 * `--path-separator=/`——Windows ripgrep 打印反斜杠路径，后续按 `/` 过滤会把
 * 结果静默清空。rg 缺席时回退纯 Node 遍历（同一过滤语义）。
 *
 * 用法：
 *   node scripts/scan-slot-registrations.mjs <hostRoot> [--json <out>] [--baseline <file>] [--pattern <regex>]
 * 输出（stdout 摘要 + --json 落盘）：
 *   { hostRoot, scannedFiles, slots: { [name]: { present, files } }, externalProvider: {...} }
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

/** 本插件消费的四个槽位；前三个是宿主自有槽（功能下限），family 是跨插件槽。 */
const HOST_SLOTS = ['conversation.input.dock', 'conversation.input.right', 'settings.general.item']
const EXTERNAL_SLOTS = ['dsh-family.tab'] // 持有者是 thinking-levels 一族插件，非宿主本体
const ALL_SLOTS = [...HOST_SLOTS, ...EXTERNAL_SLOTS]
const SCAN_EXT = /\.(js|mjs|cjs|ts|tsx|mts|cts)$/

const args = process.argv.slice(2)
const hostRoot = args[0]
if (!hostRoot) {
  console.error('用法: node scripts/scan-slot-registrations.mjs <hostRoot> [--json <out>] [--baseline <file>] [--pattern <regex>]')
  process.exit(2)
}
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : undefined
const baselineFile = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : undefined
const pattern = args.includes('--pattern') ? new RegExp(args[args.indexOf('--pattern') + 1]) : undefined

const pkgsRoot = join(hostRoot, 'node_modules', '@deepseek-ai')

/** rg 优先；回退纯 Node。统一返回相对正斜杠路径列表。
 * 两个旗标都是血泪坑，必须原样保留：
 * - `--path-separator=/`：Windows ripgrep 打印反斜杠路径，按 `/` 的后续处理会静默清空；
 * - `--no-ignore -L`：rg 默认吃 .gitignore（node_modules 被忽略 → 零输出）且
 *   不跟符号链接目录（pnpm 树的 @deepseek-ai/* 全是链接）——缺一个就扫空。
 * rg 零命中时回退 Node 遍历（statSync 跟链接），同一过滤语义。 */
function listFiles(root) {
  const rg = spawnSync('rg', ['--path-separator=/', '--no-ignore', '--hidden', '-L', '--files', root],
    { encoding: 'utf8', windowsHide: true })
  if (rg.status === 0 && rg.stdout.trim()) {
    return rg.stdout.trim().split('\n').filter((f) => SCAN_EXT.test(f) && !f.includes('/.ignored'))
  }
  const out = []
  const walk = (dir) => {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const p = join(dir, entry.name)
      const isDir = statSync(p, { throwIfNoEntry: false })?.isDirectory() ?? false
      if (isDir) walk(p)
      else if (SCAN_EXT.test(entry.name) && !p.replaceAll(sep, '/').includes('/.ignored')) {
        out.push(p.split(sep).join('/'))
      }
    }
  }
  walk(root)
  return out
}

const files = listFiles(pkgsRoot)
const slots = Object.fromEntries(ALL_SLOTS.map((name) => [name, { present: false, files: [] }]))
let scanned = 0
for (const file of files) {
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  scanned++
  for (const name of ALL_SLOTS) {
    // 引号无关的裸名匹配：点分槽名足够特异（.d.ts 双引号键 / bundle 单引号串都能命中）
    if (!slots[name].present && text.includes(name)) {
      slots[name].present = true
      slots[name].files.push(file.split('/').slice(-3).join('/'))
    }
  }
}

const result = {
  hostRoot,
  scannedFiles: scanned,
  slots,
  // 发现模式：--pattern 给出时，额外列出命中的槽位样式字面量（供人工核对改名/移槽）
  patternHits: pattern
    ? [...new Set(files.flatMap((f) => {
        let text
        try { text = readFileSync(f, 'utf8') } catch { return [] }
        return text.match(pattern) ?? []
      }))].sort()
    : undefined,
}

for (const name of ALL_SLOTS) {
  const s = slots[name]
  console.log(`${s.present ? 'FOUND ' : 'absent'}  ${name}${s.files.length ? `  (${s.files.join(', ')})` : ''}`)
}
console.log(`scanned ${scanned} files under ${pkgsRoot}`)

if (jsonOut) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(jsonOut, JSON.stringify(result, null, 2) + '\n')
  console.log(`json    ${jsonOut}`)
}

if (baselineFile) {
  const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'))
  const drift = []
  for (const name of ALL_SLOTS) {
    if (Boolean(baseline.slots?.[name]?.present) !== slots[name].present) {
      drift.push(`${name}: baseline=${baseline.slots?.[name]?.present} current=${slots[name].present}`)
    }
  }
  if (drift.length) {
    console.error(`DRIFT vs ${baselineFile}:\n  ${drift.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`ok      baseline 一致：${baselineFile}`)
}

// 功能下限断言：三个宿主自有槽必须同时在位（遮蔽失效是静默的，这里把它变成显式红）
const missingHost = HOST_SLOTS.filter((name) => !slots[name].present)
if (missingHost.length) {
  console.error(`HOST-SLOT MISSING: ${missingHost.join(', ')}`)
  process.exit(1)
}
