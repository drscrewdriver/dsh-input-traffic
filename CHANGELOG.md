# Changelog

所有重要变更与 bug 修复记录于此。版本遵循语义化版本（`dsh plugin --profile web add dsh-input-traffic` 安装）。

## Unreleased

### 变更：仅支持 DSH 0.1.5+，compat/0.1.5 线（0.2.12-beta.1）

- **`engines.dsh` 收窄为 `>=0.1.5-alpha.1 <0.2.0-0`**：0.1.5 引入 Session V3（surface node）、dockkit Sidebar 重写与 Lexical composer。核查确认本插件依赖的三个 slot 锚点（`conversation.input.dock` / `conversation.input.right` / `settings.general.item`）在 0.1.5 全部保留，`session.updateQueue` / `prompt` / `cancel` remote 无破坏记录，因此**代码零结构改动**，仅收窄支持分段。DSH 0.1.2/0.1.3 用户请留在 main 线（0.2.11-beta.1）。
- **全部 `@deepseek-ai/*` peer 区间同步收窄**到 `>=0.1.5-alpha.1 <0.2.0-0`（`@deepseek-ai/cordis` 保持 `^4.0.1`）。
- **类型契约锚点**：`src/types/contracts.d.ts` 的镜像锚点已于 2026-09-11 对照 `dsh-v0.1.5-rc.2` 验证，本版仅把头部 supported segment 更新为 0.1.5 分段。
- **注释现代化**：`src/client/index.ts` 与 `freeze-button.tsx` 中 0.1.1/0.1.2 双版本历史注释改写为 0.1.5 现状（含 0.1.5 新增相邻 slot `conversation.composer.dock` / `conversation.input.left` 说明）。无行为变更。
- **README 新增「0.1.5 已知回归」节**（宿主侧，非插件 bug）：fork 继承排队 prompt（#6314/#6197）、Lexical composer IME（#6231/#6052）、阻塞等待期间 steer 无法抢占（#6030）、升级后 client combo 缓存陈旧需强制刷新（#5999/#6374）。
- ⚠️ **无实机验证声明**：本版在无 DSH 0.1.5 实机环境下发布（lint/test/build/assembly 通过 + 文档契约静态核对），`input.for(actx)` / `blocks.set` / dock 注入 props 三个未文档化面待实机回归（清单见仓库 checklist.md）。

### 破坏性：仅支持 DSH 0.1.2+，完成 `dsh-client-runtime` 移除替换（0.2.11-beta.1）

- **`engines.dsh` 收窄为 `>=0.1.2-alpha.1 <0.2.0-0`**：`@deepseek-ai/dsh-client-runtime` 在 0.1.2-alpha.1 被整体删除（commit `be531688f3`），该版本即为本插件的硬分段点。旧版线（≤0.2.10-beta.2）继续服务 DSH 0.1.0/0.1.1。
- **`ClientContext` / `SessionId` 改由真实归属包提供**：`src/client/index.ts` 改为 `import type { Context as ClientContext } from '@deepseek-ai/cordis'` 与 `import type { SessionId } from '@deepseek-ai/dsh-session/types'`，与官方客户端插件一致。
- **契约拆除 `dsh-client-runtime` 镜像**：`src/types/contracts.d.ts` 删除 `declare module '@deepseek-ai/dsh-client-runtime/client'`；`QueuedMessage` / `SessionSnapshot` / `ISessions` 迁回 `@deepseek-ai/dsh-api-session-controller/client`，`SnapshotSelectorHook` 迁回 `@deepseek-ai/dsh-client-store`。
- **新增 `src/types/cordis-augment.d.ts`**：把 `slots` / `sessions` / `locale` / `settingsScope` / `conversation` 声明到 cordis `Context`（官方客户端插件的做法），替代已删除的 `ClientContext`；`ctx.get<IConversation>('conversation')` 相应改为 `ctx.get('conversation')`，因为真实 cordis `get` 由 `Context[K]` 决定返回类型。
- **`SettingsScopeSnapshot` 补齐 `base` / `user` / `revision`**，`SettingsScopeFace.bind` 增加可选 `decode`。
- **新增 `@deepseek-ai/dsh-session` peerDependency**；其余 `@deepseek-ai/dsh-client-*` peer 区间同步收窄到 `>=0.1.2-alpha.1 <0.2.0-0`。

### 变更：冻结按钮文案与 session-guard 的分工说明

- **按钮文案**：`steer.freeze` →「冻结追加」（Freeze & append / 凍結して追加 / 동결 후 추가），
  `steer.resume` →「恢复追加」（Resume & append / 再開して追加 / 재개 후 추가）——与 session-guard 新增的
  「暂停会话 / 继续会话」按钮并列，避免两个「恢复」混淆。只改文案，行为不变。
- **职责边界**（README 新增小节）：本插件只负责「排」——决定用户输入进 `next-step` 还是 `next-turn`、
  什么档位、何时被消费（`updateQueue(steer|remove|edit)` / `send` / `cancel`）；session-guard 只负责「停」——
  `agent/pre-step` step 门、回合级暂停、请求级 hold。`next-step` 的物理含义是「与工具返回同级的下一步
  （同一 turn 内）」，`next-turn` 才是新回合。

### 新增：DSH 双版本兼容（0.1.1-rc.2 / 0.1.2-rc.1）

- **单一产物，运行时自适应**：同一份 `lib/client.js` 在两个版本都能加载，无版本号字符串分支。
- **冻结按钮改读会话标准件**：`conversation.input.right` 在 0.1.2 起不再传 `InputZone` owner（`InputBar.tsx:466` 传 `{}`），原先读 `session.queue` 会在该版本直接抛错。现改为 `useSession(s => s.queue)`——`useSession` / `sessionId` 在两版 `SessionStandardProps` 中均存在。
- **本地契约收紧到两版交集**：`src/types/contracts.d.ts` 的 `conversation.input.right` 去掉 `owner`，`InputZone` 只声明被消费的 `input.draft`；再引入版本专属 owner 会直接 `tsc` 报错。
- **元数据**：`engines.dsh` 收窄为 `>=0.1.0-rc.7 <0.2.0-0`；`peerDependencies` 移除 `@deepseek-ai/dsh-client-runtime`（0.1.2 已改名 `dsh-client-store`，本插件运行时不依赖它）。

### 修复：等待队列被其他条目插到输入卡片之间

- **现象**：`dsh-perm-gate` 的审批提示条出现在等待队列与输入卡片之间。
- **根因**：list 型 slot 的显示位置只由 `order` 决定（`scoped-slots.tsx` 把 shadowing 胜者按 `order` 排序），`priority` 只决定同 `id` 单元格的胜者。队列条沿用官方 `order: 20`，因此排在提示条的 `30` 之前。
- **修复**：保持 `priority: -1`（赢得官方 `queue` 单元格），`order` 提到 `QUEUE_DOCK_ORDER = 1000`，排在 `conversation.input.dock` 带内所有已知条目之后，紧贴输入卡片。DSH 无 "last" 语义，第三方注册更大 `order` 仍可能插入（README 已注明该前提）。

## 0.2.8 — 2026-08-24

### 新增：日夜模式自动适配

- 队列框（等待区 dock）与冻结按钮的配色从自绘 `--ds-color-*`（dsh 中不存在该 token）改为引用 dsh 官方语义 token（`--dsw-alias-*`：bg-layer / border-l / label / interactive-bg-hover / state-success|warn|error-primary）。
- 效果：系统深色模式或 dsh 暗色主题（`body[data-ds-dark-theme]`）下自动切换为**深灰底 + 白色反色字**，三档色使用官方暗色适配值（对比度由 dsh 保证）；白天外观保持不变。
- 纯 CSS token 映射，零 JS 改动、无新增设置项。

## 0.2.6 — 2026-08-19

### Bug 修复：拖拽启动兼容（部分浏览器无法拖动）

- **现象**：部分浏览器（引擎要求 `setData` 才启动 HTML5 拖拽）中，队列行无法拖动排序。
- **根因**：`dragStart` 只设置了 `effectAllowed='move'`，未调用 `dataTransfer.setData()`。
- **修复**：正常队列行与冻结队列行的 `dragStart` 均补齐 `setData('text/plain', index)`。

## 0.2.5 — 2026-08-19

### Bug 修复：冻结队列无法拖动排序

- **现象**：冻结时队列行只能靠上移/下移按钮排序，拖拽无效。
- **根因**：冻结列表 `li` 未挂 `draggable` 与 drag 事件（拖拽只实现了正常队列行，冻结行遗漏）。
- **修复**：冻结行补齐 `draggable` + `dragStart/dragOver/drop/dragEnd`，drop 调用 `movePending(from, to)`，并加拖拽虚位提示。

## 0.2.4 — 2026-08-19

### Bug 修复：冻结时队列被锁定（顺序/内容/插入模式全不可改）

- **现象**：冻结状态下队列"不让改"——上移/下移、编辑、删除、红/黄/绿插入档位全部失效。
- **根因**：冻结列表只读渲染（无操作按钮）；残留的正常队列行按钮带 `disabled={frozen}`。
- **修复**（冻结与队列完全解耦）：
  - 冻结队列每行提供与未冻结一致的编辑（行内 textarea）/ 删除 / 上移 / 下移；
  - 冻结队列每行提供**红/黄/绿插入档位**按钮（设定恢复时的预定档位，`setTierAt`）；
  - 冻结行编辑用 `frozen:${i}` id，避开正常队列的 stale 清理；
  - 恢复（resume）按每条预定档位执行：红色档位先 `cancel()` 再发送（打断），黄/绿按序唤醒。

## 0.2.3 — 2026-08-19

### Bug 修复：冻结时等待队列被隐藏

- **现象**：冻结后等待队列消失，用户无法查看/修改已冻结的消息。
- **根因**：冻结实现把队列消息逐条 `remove` 到插件 store（driver 无 pending 自然停止），dock 渲染条件 `queue.length === 0 && !running` 触发 `return null`。
- **修复**：
  - 渲染条件增加 `!frozen`（冻结时 dock 保持挂载）；
  - 冻结列表从 freeze-store 的 `pending` 渲染（横幅 + 每行「已冻结」标记）；
  - freeze-store 增加可变操作：`pushPending` / `updatePendingAt` / `removePendingAt` / `movePending`。

## 0.2.2 — 2026-08-19

### 新增：清空确认的显式取消按钮

- 冻结队列保持可见（横幅），清空两步确认增加「取消清空」按钮（点击还原，另 3 秒超时自动还原）。

## 0.2.1 — 2026-08-18

### 新增：清空两步确认

- 首次点击「取消并清空」出现红色「确认清空？」，再点执行；避免误触清空整个等待区。

## 0.2.0 — 2026-08-18

### 新增（借鉴 dsh-queue-plus）

- **拖拽排序**：队列行直接拖动调整顺序（原生 HTML5 DnD，零运行时依赖）；箭头按钮键盘兜底保留。
- **排序并发保护**：重建期间某条消息已被 agent 认领（`queue-item-not-found`）→ 立即中止且不重发，提示「队列已变化，本次排序已取消」，绝不排乱变化中的队列。
- **折叠状态记忆**：等待区收起/展开状态持久化到 localStorage，跨会话保持。
- **清空两步确认**（见 0.2.1）。

### 工程化

- **描述更新**：package.json / GitHub repo / npm 描述加入 queue / drag-to-reorder / interject / batch clear。
- **TDD + Lint**：ESLint flat config（`eslint.config.mjs`，typescript-eslint + react-hooks）；`npm run tdd`（vitest watch）；`npm run verify` 一体化门禁（lint + test + build + 12 项装配断言）；README 双语「开发（TDD + Lint）」章节。
- 测试 32 → 43 项。
