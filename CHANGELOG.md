# Changelog

所有重要变更与 bug 修复记录于此。版本遵循语义化版本（`dsh plugin --profile web add dsh-input-traffic` 安装）。

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
