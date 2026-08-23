# Changelog

所有重要变更与 bug 修复记录于此。版本遵循语义化版本（`dsh plugin --profile web add dsh-input-traffic` 安装）。

## 0.3.0 — 2026-08-23

### 新增：中断检测与续跑（吸收自 dsh-auto-continue）

- **现象**：会话因网络错误等非人为因素中断后，等待区里的排队消息无人处理——driver 停了，排队内容卡住，只能手动重新发送。
- **新增**（纯 client，不改 harness，保持纯浏览器侧定位）：
  - **中断检测**：会话从运行转为停止、但队列仍有残留消息时，等待区顶部出现**琥珀色提示条**「会话可能已中断，{n} 条排队消息未处理完」；
  - **续跑**：提示条带「续跑」按钮，点击重新发送配置的继续文本唤醒 driver，排队消息随之继续被处理；也可开启**自动续跑**（默认关闭——纯 client 无法区分用户主动停止与非人为中断，故保守默认仅提示）。
- **吸收来源**：`src/client/auto-continue-core.ts` 为平台无关纯逻辑（错误分类 `isTransientFailure` / `isTransientAgentError`、自适应退避 `effectiveCooldown`、模板填充 `fillTemplate`、幂等护栏 `toolResultFacts`、配置解析 `resolveConfig`），来自 [dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue)（MIT, v0.8.1）——仅吸收纯逻辑，不搬 host 引擎（那会破坏本插件「纯 client、不改源码」定位，且与「冻结会话省钱」方向相反）。
- **配置**：续跑配置（继续文本 / 宽限期 / 冷却 / 连续上限 / 退避系数与上限 / 自动续跑开关 / 全局暂停）持久化到 localStorage（键 `dsh-input-traffic:auto-continue`），提示条内切换自动续跑开关即可。
- **冻结是一等公民**：续跑的一切路径都以冻结为最高优先级——`freeze()` 时显式清除中断状态；冻结期间中断检测不触发、提示条不显示、手动「续跑」与已排定的自动续跑定时器都不会发送（`resumeInterrupted` 函数级冻结守卫兜底，即使定时器在冻结前已排定也不触发）；冻结中会话自然停止不会被误判为中断。
- 测试 45 → 65 项（新增 core / store / dock 中断检测三组用例 + 4 项冻结一等公民保障用例）。

## 0.2.7 — 2026-08-20

### Bug 修复：冻结不再被「next（黄色）」插入绕过

- **现象**：已点黄的（next-step）消息在冻结时仍会被 agent 消费——冻结只分离了 `queued` 行，`steering`（next-step）行留在队列里无视冻结继续插入；恢复时计划为 next 的消息也被退化成 later（重新排队）而丢失 next 意图。
- **修复**（「冻结时不放队列」+「恢复时处理 next」）：
  - `freeze` 同时分离 `queued`（next-turn）与 `steering`（next-step）行，steering 行以 `safe_point`（next）档位存入冻结区——冻结期间真实队列（含 next-step）为空，driver 必然停下；
  - `resume` 按档位投递：`force`（红）先 `cancel()` 打断、`safe_point`（黄）走 **steer 模式投递到 next-step**（经 session face 的 `steer` prompt，不改 harness）、`queue`（绿）正常排队——恢复后 next 优先级保留，不再退化为 later。
- **新增注入动词**：`SteerQueueDockInjected.sendSteer(text)`（两个 slot 注册共用，经 `ctx.sessions.sessionOf(...).prompt([text], 'steer')` 实现）。

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
