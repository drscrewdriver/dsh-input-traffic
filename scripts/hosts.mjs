/**
 * hosts.mjs —— 宿主版本枚举的**唯一事实源**。
 *
 * 迁移基线：improve-dsh-plugins/enum-peer-migration/INDEX.md §A。
 * 枚举口径（2026-10-04 用户决定，覆盖 INDEX §E「矩阵未绿不收」的起点纪律）：
 * **起步即全量收入 npm 上六条线（0.1.0/0.1.1/0.1.2/0.1.5/0.1.7/0.2.0）的全部 rc**，
 * 由本地隔离矩阵逐格验证后**删红留绿**；矩阵结论落 `.compat-results/`。
 * 升级流程：本数组加版本 → `node scripts/sync-hosts.mjs --write` → 矩阵绿 → 发版。
 * 本数组与由它生成的三处声明（package.json peerDependencies / package.json
 * engines.dsh / dsh.plugin.json engines.dsh）**禁止手改**。
 */

/** 全部声明支持的宿主 rc（冻结；新增只在此处追加）。 */
export const supportedHosts = Object.freeze([
  // 0.1.0 线（5 个 rc）
  '0.1.0-rc.2',
  '0.1.0-rc.3',
  '0.1.0-rc.6',
  '0.1.0-rc.7',
  '0.1.0-rc.8',
  // 0.1.1 线（2 个 rc）
  '0.1.1-rc.1',
  '0.1.1-rc.2',
  // 0.1.2 线（1 个 rc；alpha 不入列）
  '0.1.2-rc.1',
  // 0.1.5 线（3 个 rc）
  '0.1.5-rc.1',
  '0.1.5-rc.2',
  '0.1.5-rc.3',
  // 0.1.7 线（2 个 rc）
  '0.1.7-rc.1',
  '0.1.7-rc.2',
  // 0.2.0 线（2 个 rc）
  '0.2.0-rc.1',
  '0.2.0-rc.2',
  // 0.2.1 线（3 个 rc）
  '0.2.1-rc.1',
  '0.2.1-rc.2', '0.2.1-rc.3', '0.2.1-rc.4', '0.2.1-rc.5',
  // 0.2.2 line
  '0.2.2-rc.1',
  // 2026-11-19 补票 rc.2..rc.5：四格 14 列探针与 rc.1 同形（gate blob 2e4ca5736a77
  // 自 alpha.2 未变、capability-seams 810ff60c1509、persistence-catalog
  // 33d9aa439563、slot-catalog 617b47fe2f29、SESSION_FORMAT_VERSION=4）；
  // rc.3→rc.4 的 packages/client 纯版本号，rc.5 只动搜索页文案与 AUTO 项。
  '0.2.2-rc.2', '0.2.2-rc.3', '0.2.2-rc.4', '0.2.2-rc.5',
])

/**
 * peerDependencies 用的**逐 rc 枚举串**（INDEX §B）。2026-11-16 修正：这里曾是
 * 有界区间 `>=… <0.3.0-0`，而 node-semver 只让预发布版命中「同元组边界」的区间，
 * 中间的每个 rc 都被排除 → pnpm/npm 解析不到 peer，装不上
 * （ERR_PNPM_OUTDATED_LOCKFILE / ETARGET / EUSAGE）。枚举才是 resolver 能吃的形状。
 */
export const peerRange = supportedHosts.join(' || ')

/**
 * engines.dsh 用的**有界区间**：下限＝本枚举起点（不硬编码，防「下限写贵了
 * 静默丢老线」），上限 `<0.3.0-0`（`-0` 是关键：裸 `<0.3.0` 在
 * includePrerelease 下仍放行 0.3.0-rc.*）。宿主侧判定带 includePrerelease，
 * 区间口径安全。
 */
export const enginesRange = `>=${supportedHosts[0]} <0.3.0-0`
/** 已实测宿主细胞：仅供 README 展示 / 矩阵脚本。 */
export const hostCells = supportedHosts.join(' || ')

/** 本地开发与矩阵默认宿主（devDependencies 若引入宿主包一律钉这里）。 */
export const developmentHost = '0.2.1-rc.5'

/**
 * peer 闸门指向的宿主子包（本插件 client 半区实际消费的宿主契约面；六包经
 * npm 普查在六条线全部逐版存在——2026-10-04 registry 实读，无需分包拆枚举）。
 * `@deepseek-ai/cordis` 不在此列：它不随宿主线走，单独保留 `^4.0.1`。
 * sync-hosts 据此写 peerDependencies（转必需，无 peerDependenciesMeta）。
 */
export const hostPeerPackages = Object.freeze([
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-session',
])
