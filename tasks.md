# Tasks

## Phase 1: 分支与元数据
- [ ] task_1: `git checkout -b compat/0.1.5`（基于 main @ b5eccd3），确认干净工作树
- [ ] task_2: `package.json` — version → `0.2.12-beta.1`；`engines.dsh` → `>=0.1.5-alpha.1 <0.2.0-0`；7 个 `@deepseek-ai/*` peerDependencies 区间 `>=0.1.2-alpha.1` → `>=0.1.5-alpha.1`
- [ ] task_3: `dsh.plugin.json` version → `0.2.12-beta.1`

## Phase 2: 源码注释现代化（零行为变更）
- [ ] task_4: `src/types/contracts.d.ts` — 头部 supported segment 改 `>=0.1.5-alpha.1 <0.2.0-0`，锚点注释保留
- [ ] task_5: `src/client/index.ts` — 头部与 QUEUE_DOCK_ORDER 注释中 0.1.1/0.1.2 措辞改为 0.1.5 现状（含 0.1.5 新增相邻 slot `conversation.composer.dock` / `conversation.input.left` 说明）
- [ ] task_6: `src/client/freeze-button.tsx` — DUAL-VERSION 注释改为 0.1.5 单版本描述

## Phase 3: 文档
- [ ] task_7: README.md — 支持矩阵改 `≥ 0.1.5-alpha.1 ✅`（< 0.1.5 指回 main 线 0.2.11.x）；新增「0.1.5 已知回归」节（#6314 fork 队列 / #6231 IME / #6030 steer 边界 / #5999+#6374 combo 缓存，附升级排障：先强制刷新浏览器）
- [ ] task_8: README.en.md 同步 task_7；检查 ja/ko README 是否有兼容矩阵小节，有则同步
- [ ] task_9: CHANGELOG.md `Unreleased` 下新增 `0.2.12-beta.1` 小节（分段收窄 + 注释现代化 + 已知回归披露）；CHANGELOG.ja.md / CHANGELOG.ko.md 同步

## Phase 4: 验证与收尾
- [ ] task_10: `npm run verify`（lint + test + build + verify-assembly）全绿
- [ ] task_11: `git diff main` 复核——src 仅有注释变更、lib 无变化、元数据符合 spec
- [ ] task_12: 提交（feat: DSH 0.1.5-only line — narrow segment to >=0.1.5-alpha.1, disclose 0.1.5 regressions）并推送 origin/compat/0.1.5
