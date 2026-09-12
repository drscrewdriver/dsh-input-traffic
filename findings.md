# Findings

## 架构决策
- **0.1.5 适配 = 元数据/文档分段 + 注释现代化，代码零结构改动**。依据：探索代理逐项核查（2026-09-13）确认 `conversation.input.dock`（official-repo/docs/subsystems/slots.md:154）、`conversation.input.right`（:157）、`settings.general.item`（:125）三个 slot 在 0.1.5 全部保留；`session.updateQueue` remote 语义保留且扩充（session.md:787）。
- **类型镜像已就位**：`src/types/contracts.d.ts:17` 注明镜像锚点于 2026-09-11 对照 dsh-v0.1.5-rc.2 验证，无需重写，仅需把头部 supported segment 从 `>=0.1.2-alpha.1` 改为 `>=0.1.5-alpha.1`。

## 技术选型
- inject 列表 `['slots','locale','sessions','conversation','settingsScope']` 不变：`slots/locale/settingsScope` 出现在 0.1.5 官方 cookbook 示例（adding-a-settings-card.md:58）；`sessions` 服务名在 plugin-framework/compatibility-guide.md:370 的 0.1.5 模板中仍有效；`conversation` 无移除记录。
- `settingsScope.bind({namespace:'ui-conversation'})` 面在 0.1.5 不变（cookbook:61 仍是标准写法）。`busyEnter` 字段为官方未文档化设置，0.1.5 文档未提及——保持现状写入（best-effort），`settings.general.item` 的 composer-enter 行 shadow 依赖该行仍存在，标记待实机确认。

## 契约核查结论（10 项）
| 契约 | 0.1.5 状态 | 证据 |
|------|-----------|------|
| conversation.input.dock | ✅ 保留 | slots.md:154 |
| conversation.input.right | ✅ 保留 | slots.md:157 |
| settings.general.item | ✅ 保留 | slots.md:125 |
| send/cancel/updateQueue | ✅（updateQueue 增加子代理身份授权检查，主会话不受影响） | session.md:772-787, subagent.md:152 |
| input.for/blocks.set | ⚠️ 文档未记载，无破坏记录，待实机 | 未查到 |
| sessions.scope 模式 | ✅ 成立 | cookbook:58, compatibility-guide.md:370 |
| settingsScope/busyEnter | ✅ 面不变；字段未文档化 | cookbook:61 |
| locale.register | ✅ 无变更记录 | — |
| dsh.client.inject 列表 | ✅ 不需新增；官方矩阵已标注本插件 0.1.5 ✅ | distribution-strategy.md:55, dsh-version-migration-guide.md:105 |
| token-meter/permissionPresets/RPC | ✅ 均非强制（插件不使用） | v0.1.5-migration.md:29,125-136 |

## 风险识别
- **无实机验证**（最大风险）：`input.for(actx).actions.setDraft/.notify`、`conversation.blocks.set`、dock 注入 props 三个面文档未记载。缓解：交付物含逐项手工回归清单（checklist「待实机」节）。
- **fork 继承队列**（#6314/#6197/#6277，0.1.5-rc.x）：fork 会把父会话已入队未执行的 prompt 带进子会话自动重跑——正是本插件管理的队列。插件无法可靠干预，README 披露 + 等官方修复。
- **Lexical composer IME**（#6231/#6052/#6271）：`setDraft` 回填与发送路径在 IME/浏览器翻译环境行为可能与 0.1.2 不同。README 披露。
- **steer 抢占边界**（#6030）：阻塞式 job_output(wait) 期间 steer 无法抢占（最长 10 分钟）。用户可能归因于插件的 interject 功能。README 披露。
- **client combo 缓存陈旧**（#5999/#6374）：从旧 profile 升级到 0.1.5 后 client combo 可能缺失新 bundle 模块，插件树整体不激活。README 排障节写明「先强制刷新浏览器」。
- **order=1000 的带内排序是约定非保证**：0.1.5 新增相邻 slot（`conversation.composer.dock`、`conversation.input.left`，slots.md:155-156），若官方/第三方新条目注册更大 order 仍可能插到队列条之后。现无证据表明发生，不改。

## 依赖事实
- npm 上 `@deepseek-ai/dsh-client-ui-conversation` 已发布至 `0.1.5-rc.2`，peer 区间 `>=0.1.5-alpha.1 <0.2.0-0` 可满足。
- 本地 node_modules 缺 dsh-client-ui-conversation/locale/session/ui-settings 类型包——项目靠 `src/types/contracts.d.ts` 的 `declare module` 本地契约编译（有意设计，npm 发布链不完整），构建不依赖这些包。
