/**
 * test-host-compat.mjs —— 本地隔离矩阵执行体（improve-dsh-plugins/enum-peer-migration
 * /INDEX.md §E：`_wt` 工作树 + 离线 tgz 的 CI 前身）。
 *
 * 以 _tools/host-compat/test-host-compat.mjs（P0 date-wrapper 定型版）为底，按
 * 本仓改编（_tools README §3 改编清单）：
 *   - 插件名正则 `dsh-input-traffic-.*\.tgz`；重名归因签名按 `input-traffic` 过滤；
 *   - **P2 槽位门禁**：boot 绿后对沙箱宿主树跑 scan-slot-registrations.mjs——
 *     三个宿主自有槽（conversation.input.dock / conversation.input.right /
 *     settings.general.item）是功能下限，缺席即 `plugin-inert`（遮蔽失效是
 *     静默的，这里把它变成显式结论）；`dsh-family.tab` 持有者是跨插件族
 *     （thinking-levels 一族），裸沙箱缺席属预期，仅记录。
 *
 * 每格 = 一个宿主 rc，流程（配方与 reffer/dsh-skills-manager、paste-dock 两家
 * 执行体一致，P0 试点定型）：
 *   1. tgz 缓存（`pnpm pack @deepseek-ai/dsh@<version>` → `.compat-results/host-tgz/`）；
 *   2. 沙箱安装：`@deepseek-ai/dsh` tgz + **钉宿主自己的 Cordis 线**（INDEX §A 铁律：
 *      cordis 本体 + group/hmr/include/loader/timer 五件，按宿主线 4.0.2/4.0.4 分档），
 *      pnpm `--ignore-scripts`（node-addon-require-builtin 无 postinstall，实测无影响；
 *      npm 11 对该树 idealTree 解析在 Windows 上 >15min 且零输出，弃用）；
 *   3. 插件经**宿主 CLI 自建 profile**：`dsh plugin --profile web add <插件tgz>` ——
 *      peer 闸在装格这一步即咬合（add 日志可判 plugin-blocked；本插件 peer 已转
 *      必需，枚举外宿主在此步即拒），profile 由宿主按该线的正确模板创建；
 *   4. 引导形态自动协商：A 形 `--profile web --port 0 --no-open`，老线不认顶层
 *      --port/--no-open 时回退 C 形裸启动；就绪横幅 / 提前退出 / 超时先到先得。
 *   5. 槽位存在性扫描（沙箱删除前）。
 *
 * 归因（日志签名）：
 *   - ready + 无签名            → green（且宿主三槽在位）
 *   - 宿主三槽缺席（boot 绿）    → plugin-inert（枚举在列但功能下限缺失，遮蔽静默失效）
 *   - /requires the Cordis HMR service/ → host-blocked（宿主引导墙，非插件问题）
 *   - /is incompatible with dsh/（add 或 boot 期）→ plugin-blocked（peer 闸拒入/拒挂）
 *   - 挂载/审计/重名签名        → plugin-blocked（notes 注明）
 *
 * 产物：`matrix/<v>/{sandbox, plugin-add.log, boot-*.log, slots.json, result.json}`
 * + 汇总 `results.json`；绿名单写 `verified.json`（sync-hosts 据此下发四语 README
 * 的 Runtime-verified 行）。浏览器半区验收（Playwright 键级断言）沿用 paste-dock
 * P1 先例后置为 CI 化任务，本地矩阵以上述五步为准。
 *
 * 用法：
 *   node scripts/test-host-compat.mjs                     # 全量（hosts.mjs 枚举）
 *   node scripts/test-host-compat.mjs --only 0.2.0-rc.2   # 单格复跑
 *   node scripts/test-host-compat.mjs --keep              # 保留 sandbox 便于复查
 *   node scripts/test-host-compat.mjs --force             # 忽略已有结论强制重跑
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { supportedHosts } from './hosts.mjs'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const RESULTS = path.join(ROOT, '.compat-results')
const MATRIX = path.join(RESULTS, 'matrix')
const TGZ_CACHE = path.join(RESULTS, 'host-tgz')
const WIN32 = process.platform === 'win32'
const PNPM = WIN32 ? 'pnpm.cmd' : 'pnpm'
const INSTALL_ARGS = ['install', '--ignore-scripts', '--prefer-offline', '--loglevel=error']
const REGISTRY = '--registry=https://registry.npmjs.org/'

/** INDEX §A 铁律：cordis-plugin-* 钉宿主自己的 Cordis 线（映射表与 paste-dock 执行体一致）。 */
function cordisPin(hostVersion) {
  const [triplet] = hostVersion.split('-')
  const [maj, min, patch] = triplet.split('.').map(Number)
  return [maj, min, patch] >= [0, 1, 7] ? '4.0.4' : '4.0.2'
}
const CORDIS_PLUGIN_PINS = {
  '4.0.2': {
    '@deepseek-ai/cordis-plugin-group': '1.0.2',
    '@deepseek-ai/cordis-plugin-hmr': '1.0.17',
    '@deepseek-ai/cordis-plugin-include': '1.0.7',
    '@deepseek-ai/cordis-plugin-loader': '1.0.3',
    '@deepseek-ai/cordis-plugin-timer': '1.1.4',
  },
  '4.0.4': {
    '@deepseek-ai/cordis-plugin-group': '1.0.4',
    '@deepseek-ai/cordis-plugin-hmr': '1.0.19',
    '@deepseek-ai/cordis-plugin-include': '1.0.9',
    '@deepseek-ai/cordis-plugin-loader': '1.0.5',
    '@deepseek-ai/cordis-plugin-timer': '1.1.6',
  },
}

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined
const keep = args.includes('--keep')
const force = args.includes('--force')
const bootTimeoutSec = args.includes('--timeout') ? Number(args[args.indexOf('--timeout') + 1]) : 60
const versions = only ? [only] : [...supportedHosts]

/** 顺序跑外部命令，非零退出/超时均带尾巴抛错。（win32 的 pnpm.cmd 必须经 shell 启动） */
function run(cwd, cmd, cmdArgs, label, limitMs = 15 * 60_000, env = process.env) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: 'utf8', shell: WIN32, windowsHide: true, timeout: limitMs, env })
  if (r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM') {
    throw new Error(`${label} 超时（>${Math.round(limitMs / 60_000)}min）`)
  }
  if (r.status !== 0) {
    throw new Error(
      `${label} 失败（exit ${r.status}${r.error ? `，${r.error.code ?? r.error.message}` : ''}）\nstdout: ${(r.stdout ?? '').slice(-600)}\nstderr: ${(r.stderr ?? '').slice(-600)}`,
    )
  }
  return r
}

async function ensureTgz(version) {
  await mkdir(TGZ_CACHE, { recursive: true })
  const dest = path.join(TGZ_CACHE, `deepseek-ai-dsh-${version}.tgz`)
  if (existsSync(dest)) return dest
  console.log(`       pack host ${version}`)
  await run(TGZ_CACHE, PNPM, ['pack', `@deepseek-ai/dsh@${version}`, '--loglevel=error'], `pnpm pack host ${version}`)
  return dest
}

/** 就绪横幅（宽松：老版本横幅不一定带 dsh 前缀）。 */
const READY_RE = /https?:\/\/(127\.0\.0\.1|localhost):/
const HMR_WALL_RE = /requires the Cordis HMR service/
const COMPAT_BLOCK_RE = /is incompatible with dsh/
const AUDIT_RE = /startup audit|failed to mount|mount error|failed to start/i
const DUP_RE = /already (been )?registered|duplicate|conflict/i

/** 无头启动一次，返回 { log }；就绪/退出/超时先到先得，结束后杀进程树。 */
async function bootOnce(binJs, cwd, env, extraArgs, timeoutSec) {
  const child = spawn(process.execPath, [binJs, ...extraArgs], { cwd, env, windowsHide: true })
  let log = ''
  child.stdout.on('data', (d) => { log += d })
  child.stderr.on('data', (d) => { log += d })
  const exited = new Promise((resolve) => child.on('exit', (code) => resolve({ exited: true, code })))
  const timer = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), timeoutSec * 1000))
  const ready = (async () => {
    while (!READY_RE.test(log)) await new Promise((r) => setTimeout(r, 400))
    return { ready: true }
  })()
  const outcome = await Promise.race([exited, timer, ready])
  if (!outcome.exited) {
    if (WIN32) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true })
    else child.kill('SIGKILL')
  }
  await new Promise((r) => setTimeout(r, 300)) // 杀树后给日志冲刷留时间
  return { outcome, log }
}

/** 槽位存在性扫描（P2 门禁）：宿主自有槽是功能下限；family 槽跨插件，仅记录。 */
function scanSlots(cell, sandbox) {
  const out = path.join(cell, 'slots.json')
  const r = spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'scan-slot-registrations.mjs'), sandbox, '--json', out],
    { encoding: 'utf8', windowsHide: true, timeout: 5 * 60_000 })
  if (!existsSync(out)) {
    if (r.stdout) console.log(r.stdout)
    if (r.stderr) console.log(r.stderr)
    return { slots: {}, error: `scanner exit ${r.status}` }
  }
  return JSON.parse(readFileSync(out, 'utf8'))
}

async function runCell(version) {
  const cell = path.join(MATRIX, version)
  const sandbox = path.join(cell, 'sandbox')
  const homeDir = path.join(sandbox, 'home')
  const userProfile = path.join(sandbox, 'user')
  const workspace = path.join(sandbox, 'workspace')
  for (const dir of [sandbox, userProfile, workspace]) await mkdir(dir, { recursive: true })
  const env = { ...process.env, DSH_HOME: homeDir, USERPROFILE: userProfile }
  const checks = { version, notes: [] }

  // 1-2. 宿主 tgz + 钉线安装（宿主 + cordis 五件套）
  const hostTgz = await ensureTgz(version)
  const cordis = cordisPin(version)
  const hostDir = path.join(sandbox)
  if (!existsSync(path.join(hostDir, 'node_modules', '@deepseek-ai', 'dsh', 'package.json'))) {
    const pins = { '@deepseek-ai/cordis': cordis, ...CORDIS_PLUGIN_PINS[cordis] }
    await writeFile(path.join(hostDir, 'package.json'), JSON.stringify({
      name: 'dsh-host-cell',
      private: true,
      dependencies: { '@deepseek-ai/dsh': pathToFileURL(hostTgz).href, ...pins },
    }, null, 2))
    console.log(`       install host ${version}（cordis 线 ${cordis}）…`)
    await run(hostDir, PNPM, INSTALL_ARGS, `install host ${version}`)
  }
  checks.hostInstalled = JSON.parse(await readFile(path.join(hostDir, 'node_modules', '@deepseek-ai', 'dsh', 'package.json'), 'utf8')).version === version
  if (!checks.hostInstalled) throw new Error(`宿主安装版本与格子不符: ${version}`)
  const binJs = path.join(hostDir, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')

  // 3. 打插件包 → 宿主 CLI 自建 profile 并装入（peer 闸在此步咬合）
  console.log(`       pack plugin …`)
  await run(ROOT, PNPM, ['pack', '--pack-destination', cell, '--loglevel=error'], 'pnpm pack plugin')
  const packed = (await readdir(cell)).find((f) => /^dsh-input-traffic-.*\.tgz$/.test(f))
  if (!packed) throw new Error('插件 tgz 打包失败')
  const pluginTgz = path.join(cell, packed)
  const addRun = spawnSync(WIN32 ? 'cmd.exe' : 'node',
    WIN32 ? ['/c', binJs, 'plugin', '--profile', 'web', 'add', pluginTgz, REGISTRY] : [binJs, 'plugin', '--profile', 'web', 'add', pluginTgz, REGISTRY],
    { cwd: sandbox, encoding: 'utf8', shell: false, windowsHide: true, timeout: 10 * 60_000, env })
  const addLog = `${addRun.stdout ?? ''}${addRun.stderr ?? ''}`
  await writeFile(path.join(cell, 'plugin-add.log'), addLog)
  checks.pluginAdded = addRun.status === 0
  if (!checks.pluginAdded) {
    if (COMPAT_BLOCK_RE.test(addLog)) {
      checks.verdict = 'plugin-blocked'
      checks.notes.push('plugin add 阶段 peer 闸拒绝')
      await writeResult(cell, checks)
      return checks
    }
    throw new Error(`dsh plugin add 失败（exit ${addRun.status}）\n${addLog.slice(-600)}`)
  }

  // 4. 引导形态协商：A 形（--port 0 --no-open）→ C 形（裸启动）
  const shapes = [
    ['A', ['--profile', 'web', '--port', '0', '--no-open']],
    ['C', ['--profile', 'web']],
  ]
  let last = { outcome: {}, log: '' }
  let shapeUsed
  for (const [shape, extra] of shapes) {
    last = await bootOnce(binJs, workspace, env, extra, bootTimeoutSec)
    shapeUsed = shape
    await writeFile(path.join(cell, `boot-${shape}.log`), last.log)
    if (last.outcome.ready || HMR_WALL_RE.test(last.log) || COMPAT_BLOCK_RE.test(last.log)) break
    if (shape === 'C') break
    checks.notes.push(`A 形旗标不被 ${version} 接受，回退 C 形`)
  }

  // 5. 归因（日志签名）+ P2 槽位门禁
  checks.booted = Boolean(last.outcome.ready)
  checks.bootShape = shapeUsed
  if (checks.booted) {
    checks.noMountError = !AUDIT_RE.test(last.log)
    checks.noDupContext = !last.log.split('\n').some((line) => /input-traffic/.test(line) && DUP_RE.test(line))
    checks.noCompatBlock = !COMPAT_BLOCK_RE.test(last.log)
    const scan = scanSlots(cell, sandbox)
    checks.slotScan = Object.fromEntries(Object.entries(scan.slots ?? {}).map(([k, v]) => [k, v.present]))
    if (scan.error) checks.notes.push(`槽位扫描失败：${scan.error}`)
    checks.noMountError = checks.noMountError && !scan.error
    checks.verdict = checks.noMountError && checks.noDupContext && checks.noCompatBlock
      ? (checks.slotScan['conversation.input.dock'] && checks.slotScan['conversation.input.right'] && checks.slotScan['settings.general.item']
          ? 'green'
          : 'plugin-inert')
      : 'plugin-blocked'
    if (checks.verdict === 'plugin-inert') {
      checks.notes.push(`宿主自有槽缺席（遮蔽静默失效）：${['conversation.input.dock', 'conversation.input.right', 'settings.general.item'].filter((n) => !checks.slotScan[n]).join(', ')}`)
    }
    if (!checks.noDupContext) checks.notes.push('疑似重名注册签名')
  } else if (HMR_WALL_RE.test(last.log)) {
    checks.verdict = 'host-blocked'
    checks.notes.push('宿主 hmr 引导墙（基座对照亦然，git 历史双臂矩阵留档）——宿主侧问题，非插件不兼容')
  } else if (COMPAT_BLOCK_RE.test(last.log)) {
    checks.verdict = 'plugin-blocked'
    checks.notes.push('boot 阶段 peer 闸拦截')
  } else {
    checks.verdict = 'plugin-blocked'
    checks.notes.push(`未就绪且无已知签名（${last.outcome.exited ? `exit ${last.outcome.code}` : '超时'}），见 boot 日志`)
  }
  checks.green = checks.verdict === 'green'
  await writeResult(cell, checks)
  return checks
}

async function writeResult(cell, checks) {
  await writeFile(path.join(cell, 'result.json'), JSON.stringify(checks, null, 2) + '\n')
}

// ── 主流程 ───────────────────────────────────────────────────────────────────
await mkdir(MATRIX, { recursive: true })
const results = []
for (const version of versions) {
  const cellResult = path.join(MATRIX, version, 'result.json')
  if (!force && existsSync(cellResult)) {
    const prev = JSON.parse(await readFile(cellResult, 'utf8'))
    if (prev.green || prev.verdict === 'host-blocked') {
      console.log(`skip   ${version}（已有结论 ${prev.verdict}，--force 重跑）`)
      results.push(prev)
      continue
    }
  }
  process.stdout.write(`cell   ${version} … `)
  try {
    const checks = await runCell(version)
    console.log(`${checks.verdict.toUpperCase()}${checks.notes.length ? `（${checks.notes.join('；')}）` : ''}`)
    results.push(checks)
  } catch (error) {
    console.log('ERROR')
    const checks = { version, verdict: 'error', green: false, error: String(error.message ?? error) }
    results.push(checks)
    await mkdir(path.join(MATRIX, version), { recursive: true })
    await writeResult(path.join(MATRIX, version), checks)
  }
  if (!keep) await rm(path.join(MATRIX, version, 'sandbox'), { recursive: true, force: true })
}

const verified = results.filter((r) => r.green).map((r) => r.version)
const inert = results.filter((r) => r.verdict === 'plugin-inert').map((r) => r.version)
const pluginBlocked = results.filter((r) => r.verdict === 'plugin-blocked').map((r) => r.version)
const hostBlocked = results.filter((r) => r.verdict === 'host-blocked').map((r) => r.version)
await writeFile(path.join(RESULTS, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + '\n')
await writeFile(path.join(RESULTS, 'verified.json'), JSON.stringify({ generatedAt: new Date().toISOString(), verified, inert, pluginBlocked, hostBlocked }, null, 2) + '\n')
console.log(`\n绿 ${verified.length}/${results.length}: ${verified.join(', ') || '（无）'}`)
if (inert.length) console.log(`枚举在列但功能下限缺失（plugin-inert）${inert.length}: ${inert.join(', ')}`)
if (pluginBlocked.length) console.log(`插件不兼容 ${pluginBlocked.length}: ${pluginBlocked.join(', ')}`)
if (hostBlocked.length) console.log(`宿主阻塞（不可判定）${hostBlocked.length}: ${hostBlocked.join(', ')}`)
if (!only) console.log('下一步：node scripts/sync-hosts.mjs --write  # 把 verified 清单下发四语 README')
