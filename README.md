<p align="center">
  <strong>给 DeepSeek Harness Web GUI 一个三档输入交通管制</strong>
</p>
<p align="center">
  <strong>中文</strong> · <a href="README.en.md">English</a>
</p>
<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img alt="Public beta" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
</p>

# dsh-input-traffic

> 智能体忙碌时不再只有"打断"或"排队"二选一：红色打断立即输入、黄色下一轮插入、绿色排队到最后，三档并存；邻近 DeepSeek 高峰收费时段可一键冻结会话，错峰再恢复继续。

无需修改 dsh 源码、无需提 PR：`dsh plugin` 命令组装 + bundle patch 装配的 cordis client 插件。

> 💡 **为什么推荐「冻结会话」**：DeepSeek 已于 2026-08-17 实行**峰谷计费**——高峰时段（北京时间 9:00-12:00、14:00-18:00）单价为闲时（其余时段，含午间、夜间、周末与节假日）的 **2 倍**。长跑型会话若跨越高价窗口，手动冻结暂停 API 消耗、错峰再恢复，费用最多可省 **50%**。
>
> **目前建议搭配**：配合**一般提醒**插件（如 [dsh-notify](https://github.com/zhengjy01/dsh-notify)，到点桌面提醒「该冻结/该恢复」）与**计费统计**插件（如 [dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage)、[dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker)、[dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)，核对冻结前后的实际花费），形成「提醒 → 冻结 → 错峰恢复 → 对账」的省钱闭环。

## 它能做什么

- **三档插入并存**：智能体忙碌时，每一条输入都先进入等待区，再按需选择何时进入对话——不再只有一个"打断"或只有一个"排队"：
  - 🔴 **红色（now）**：打断当前轮次并立即输入——当前生成停止，消息作为新输入被 agent 立刻处理并回复；
  - 🟡 **黄色（next）**：下一自然轮插入——不打断当前执行，当前正在进行的动作（工具调用 / 本轮生成）结束后插入；
  - 🟢 **绿色（later）**：待整个逻辑执行完成后输入——排队等待，上一轮输入的所有动作都结束后再处理（默认状态）。
- **黄色可逆**：对已插话（黄色）的消息点绿色按钮，可撤销插入、收回排队状态。
- **排队内容可再编辑**：已经排在队列中的消息可以直接在队列里编辑——多行编辑区随内容自动扩展，长消息也能完整查看与修改（Enter 保存 / Shift+Enter 换行 / Esc 取消）；也可**打回输入框再编辑**（回填 composer 修改后重新发送）。
- **队列管理**：等待区的消息可以**上移 / 下移调整顺序**、删除，以及队列级「取消并清空」。
- **编辑不丢内容**：编辑保存失败（消息已被 agent 认领）时，编辑内容自动退回主输入框，不会丢失；主输入框已有内容时不覆盖。
- **高峰期冻结**：输入框右侧「冻结会话」按钮——邻近 DeepSeek 高峰收费时段（9:00-12:00、14:00-18:00）时主动暂停 API 消耗：当前轮次自然完成后暂停，未发送队列冻结保存；「恢复会话」后在非高价时间继续处理。
- **中断检测与续跑**（吸收自 [dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue)，纯逻辑层）：会话因网络错误等非人为因素中断、但排队消息未处理完时，等待区顶部出现琥珀色提示条，可点击「续跑」重新发送继续文本唤醒 driver；也可开启**自动续跑**（默认关闭，见「中断检测与续跑」章节）。
- **接管官方行为**：插件生效时，官方设置面板的「繁忙时 Enter 键行为」设置行不再显示（Enter 行为固定为绿色排队）。

## 界面预览

等待区与冻结按钮在会话页面中的布局示意：

```text
┌─ 输入区 ──────────────────────────────── 发送 ── [❄ 冻结会话] ─┐
└────────────────────────────────────────────────────────────────┘
┌─ 排队等待区（3 档规划 dock）────────────────────────────────────┐
│ ┌ 2 条排队消息                                     🗑 取消并清空 ┐ │
│ │ 🟢 排队   第一条消息内容预览…          ↑ ↓ 打回 编辑 删除      │ │
│ │ 🟢 排队   第二条消息内容预览…          ↑ ↓ 打回 编辑 删除      │ │
│ │   编辑中：多行文本区随内容自动扩展（上限约 8 行）              │ │
│ │   Enter 保存 · Shift+Enter 换行 · Esc 取消                    │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## 三档语义

| 档位 | 颜色 | 语义 | 底层机制（dsh 现有 RPC 组合） |
|---|---|---|---|
| **later**（默认） | 绿 | 排队：上一轮输入的动作都结束后再处理；对已插话（黄色）的消息点绿 = **撤销插入，收回排队** | Enter 默认 queue → `agent.followup()`（next-turn）；收回 = `updateQueue(remove)` + `send(text)` |
| **next** | 黄 | 下一自然轮插入：当前正在执行的动作结束后插入 | `updateQueue(id, { kind: 'steer' })` → `agent.steer()`（next-step 步骤边界） |
| **now** | 红 | 打断并输入：停止当前轮次，消息立即被处理 | `cancel()` → `updateQueue(remove)`（避免 inbox 重复插入拒绝）→ `send(text)`（重新提交，唤醒 driver 立即处理） |

> 红色为什么是 cancel + remove + resend：harness 的 inbox 禁止重复插入同一条消息，打断后直接 steer 会被拒绝导致消息滞留（详见「常见问题」）。

## 会话冻结 / 恢复（高峰期暂停）⭐ 推荐

> **省钱定位**：这是本插件面向 DeepSeek 峰谷计费（2026-08-17 生效）的**核心推荐功能**——高峰时段（9:00-12:00、14:00-18:00）单价翻倍、闲时半价。手动冻结把不紧急的生成「暂停」到闲时再恢复，直接规避高价窗口，长跑型会话最多省一半费用。
>
> **建议搭配**：**一般提醒**插件（如 [dsh-notify](https://github.com/zhengjy01/dsh-notify)）在进入/离开高峰时段时提醒你手动冻结/恢复；**计费统计**插件（如 [dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage)、[dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker)、[dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)）在冻结前后核对实际花费。

输入框右侧（发送按钮旁）的「冻结会话 / 恢复会话」按钮，用于即将进入 DeepSeek 高峰收费时段时暂停 API 消耗：

- **冻结**：当前轮次**不打断**、自然完成后暂停；**队列与冻结解耦**——冻结只停止 agent 消费（执行/插入/追加），等待队列保持可见且**完全可操作**（排序、编辑、删除、设定红/黄/绿插入档位），与未冻结无明显区别；
- **恢复**：按修改后的队列重新入队，**按每条预定的档位执行**（红=打断并立即处理，黄=插话，绿=排队），agent 按 FIFO 继续处理；
- 引擎实现：冻结 = 逐条 `updateQueue(remove)` 分离队列（含档位的副本存于插件 store），当前轮次完成后 driver 因无 pending 自然停止；冻结期间对队列的修改（文本/顺序/档位）实时写回 store；恢复 = 逐条 `send(text)` 重新提交并唤醒 driver（红色档位的条目先 `cancel()` 再发送）；
- 注意：含非文本内容（图片）的排队消息无法重发，冻结时会随队列释放（不会恢复）。

## 中断检测与续跑（吸收自 dsh-auto-continue）

会话因**非人为因素**中断（网络错误、超时、5xx 等）后，排队消息会卡在等待区无人处理。本功能在等待区顶部提供**中断提示条**，让你不必盯着页面也能把中断的会话续起来：

- **中断检测**：会话从运行转为停止、但等待区仍有残留排队消息时，顶部出现**琥珀色提示条**「会话可能已中断，{n} 条排队消息未处理完」（纯 client 可观测信号：running 从 true → false + 队列非空 + 未冻结）；
- **手动续跑**：提示条上的「续跑」按钮立即重新发送配置的继续文本（默认「继续」）唤醒 driver，排队消息随之继续被处理；
- **自动续跑**（默认关闭）：开启后，检测到中断会等待**宽限期**（默认 3 秒）自动续跑一次；连续失败按**自适应退避**拉长间隔（冷却 × 系数），并受**连续次数上限**保护，达到上限自动停止交回人工——绝不无限续跑；
- **为什么默认关闭**：纯 client 拿不到 `turn/end` 的失败原因，无法区分「用户主动停止」与「非人为中断」。默认只提示不擅自续跑，避免对用户主动停止的会话误续跑；
- **与冻结的关系**：冻结时队列被分离（真实队列为空），不会误触发中断提示；续跑与「冻结省钱」方向一致——续跑只唤醒被中断的会话继续消耗，不改变冻结语义。

> **吸收边界**：本功能仅吸收 [dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue)（MIT, v0.8.1）的**平台无关纯逻辑**（错误分类 `isTransientFailure` / `isTransientAgentError`、自适应退避 `effectiveCooldown`、幂等护栏 `toolResultFacts`、模板填充 `fillTemplate`），实现于 `src/client/auto-continue-core.ts`。**不搬其 host 引擎**（`session/event` firehose、`agent.followup`、SSE 桥）——那需要把本插件升级为 client + host 双半插件，破坏「纯浏览器侧、不改官方源码」的定位；错误分类等纯逻辑已保留在模块内，供后续扩展（如续跑失败时按分类决定是否继续）。

## 队列管理

等待区每条消息（未冻结时）提供：

| 操作 | 说明 |
|---|---|
| 上移 / 下移 | 调整 FIFO 顺序（整个队列按新顺序重建；含图片消息时禁用） |
| **拖拽排序** | 按住行直接拖动到目标位置（原生 HTML5 DnD，无额外依赖）；与箭头按钮同样走服务端重建 |
| 打回输入框编辑 | 消息内容回填 composer 输入框并从队列移除，编辑后重新发送 |
| 编辑 / 删除 | 多行文本区直接修改排队内容 / 取消该消息 |
| 红 / 黄 / 绿规划 | 见「三档语义」 |
| 取消并清空 | 两步确认后停止当前执行并清空全部排队消息（首次点击弹出「确认清空？」） |

排序的**并发保护**：重建期间若某条消息已被 agent 认领（`queue-item-not-found`），本次排序立即中止且不重发，提示「队列已变化，本次排序已取消」——绝不会把变化中的队列排乱。

等待区的**展开状态会记忆**：手动收起/展开后，下次打开插件保持同样状态。

编辑排队消息（行内编辑）时：

- **自动扩展**：编辑区随内容实时增高，长消息完整展开，上限约 8 行，超出后内部滚动；
- **快捷键**：`Enter` 保存，`Shift+Enter` 换行，`Esc` 取消（中文输入法组合期间不会误保存）；
- **失败兜底**：保存时若消息已被 agent 认领（如「已经开始发送」），编辑内容自动退回主输入框并提示，**不会丢失**；仅当主输入框为空时回填，已有草稿不被覆盖。

## 安装

```sh
# 方式一：从 npm 安装（推荐）
#   （profile 是 pnpm workspace root，add 需带 -w 参数）
dsh plugin --profile web add dsh-input-traffic -w

# 方式二：git 或本地路径组装
# dsh plugin --profile web add /absolute/path/to/dsh-input-traffic -w
#    （git 安装后需在 profile 的 node_modules 内现场构建：npm install --legacy-peer-deps && npm run build）

# 确认组合树包含新行
dsh web --dump-config | grep -B1 -A2 'input-traffic'

# 重启 dsh web —— 必做！运行中实例不热载 bundle 层
dsh web
```

本地构建与测试：

```sh
npm install --legacy-peer-deps   # @deepseek-ai client 包链在 npm 上不完整，仅装工具链
npm run build                    # tsc（lib/types）+ tsdown（lib/index.js + lib/client.js）
node examples/verify-assembly.mjs  # 12 项装配断言
npm test                         # 61 项 vitest 组件测试
npm run lint                     # ESLint（src + tests，flat config）
npm run verify                   # 一体化门禁：lint + test + build + verify-assembly
```

## 开发（TDD + Lint）

本项目按 **TDD**（测试驱动开发）维护：先写失败用例，再实现到全绿。

```sh
npm run tdd        # vitest watch：改动即重跑，红→绿闭环
```

流程：

1. 在 `tests/` 新增/修改用例（红：确认新行为尚未实现）；
2. `npm run tdd` 观察失败；
3. 在 `src/` 最小实现（绿）；
4. `npm run verify` 全绿后提交（lint + 61 测试 + 构建 + 12 项装配断言）。

Lint 说明：

```sh
npm run lint       # ESLint flat config（eslint.config.mjs）
npm run lint:fix   # 自动修复可修复项
```

- 范围：`src/` 与 `tests/`（TypeScript + React）；构建产物 `lib/` 忽略；
- 规则：`@typescript-eslint/recommended` + `react-hooks` 最佳实践；未使用变量报错（下划线前缀 `_` 可豁免）。

## 使用方式

1. 智能体忙碌时直接输入并发送，消息**统一进入等待区**（默认绿色排队）；
2. 在等待区对消息点规划按钮：
   - 🟡 黄色 = 插话——当前动作结束后插入；
   - 🔴 红色 = 打断——立即中断当前动作，消息随后被处理；
   - 🟢 绿色 = 保持排队（当前默认态）；对已插话的消息点绿 = 收回排队；
3. 需要调整顺序 / 修改内容：用上移下移、打回输入框编辑或多行编辑（Enter 保存、Shift+Enter 换行）；
4. **省钱关键（推荐）**：邻近高峰时段（9:00-12:00、14:00-18:00）点击输入框右侧「冻结会话」，当前轮次完成后自动暂停，避开高价窗口；闲时点「恢复会话」继续。可配合提醒 / 计费统计插件使用（见上文「推荐」）。

## 常见问题

### 打断后消息没有回复 / 对话停住

历史问题（已修复）。根因：harness 的 inbox 禁止重复插入同一条消息——打断后直接对原消息执行 steer 会被 `"message is already pending"` 拒绝，消息滞留在队列、agent 停摆。当前实现改为 `cancel → remove → resend`（新消息重新提交），打断消息会立即被 agent 处理并回复。若仍遇到，请确认插件为最新构建并重启 dsh web。

### 编辑保存失败后，内容去哪了？

不会丢。保存失败（消息已被 agent 认领）时，编辑内容会自动退回主输入框并弹出「编辑失败，内容已退回主输入框」提示；主输入框已有内容时不回填，仅提示编辑失败。

### 设置面板里找不到「繁忙时 Enter 键行为」

正常——插件接管后该设置行被隐藏，Enter 行为固定为绿色排队（旧偏好不会在隐藏的设置行背后继续生效）。

### 冻结后排队消息消失了

正常——冻结会把队列保存到插件内存（从等待区移除），恢复后重新出现。刷新页面会丢失冻结队列，请避免冻结后刷新。

### 上移/下移按钮不可用

队列中含图片等非文本消息时，排序会禁用（图片消息无法重发）。打回输入框编辑同理。

### 打断/插话按钮不可用

智能体空闲（未运行）时红黄两档禁用——空闲时消息本来就会被立即处理，无需规划。

## 卸载

```sh
dsh plugin --profile web remove dsh-input-traffic
```

卸载后重启 dsh web，即恢复官方 queue dock 与「繁忙时 Enter 键行为」设置行。

## 兼容性与隐私

- 需要已安装 DeepSeek Harness 并使用 web profile；在 Windows / macOS / Linux 的 dsh web 上验证。
- 插件为纯浏览器侧（client）插件，所有操作均通过 dsh 现有 RPC（`session.prompt` / `session.updateQueue` / `session.cancel`）完成，**不改动任何官方源码**。
- 插件不读取、不上传任何会话内容以外的数据；冻结队列仅保存在本机浏览器内存。
- 类型契约在 `src/types/contracts.d.ts` 本地声明（npm 上 dsh client 包链不完整），构建时以 harness 源码核实为准。

## 架构

```
src/
├── index.ts                  # node half（loader 行入口，空 apply）
├── invariant.ts              # 接管不变量说明
├── types/contracts.d.ts      # @deepseek-ai/* 平台面本地类型声明
└── client/
    ├── index.ts              # browser half apply：busyEnter 固定 queue + 三处 slot 注册
    ├── steer-queue-dock.tsx  # 三档规划等待区（shadowing conversation.input.dock id queue）
    ├── freeze-button.tsx     # 冻结/恢复按钮（conversation.input.right）
    ├── freeze-store.ts       # 冻结状态共享 store（composer 按钮 ↔ dock 横幅）
    ├── hide-enter-row.tsx    # 设置行隐藏（shadowing settings.general.item id composer-enter）
    ├── auto-continue-core.ts # 中断检测纯逻辑（吸收自 dsh-auto-continue core.ts：错误分类/退避/护栏/模板）
    ├── auto-continue-store.ts# 中断标记与续跑配置 store（dock 提示条 ↔ localStorage 持久化）
    ├── locales.ts            # steer 字典（zh/en）
    └── *.module.css
```

- **slot shadowing**：list 型 slot 同 id + 更低 priority（-1）覆盖官方条目（QueueDock、EnterBehaviorRow）。
- **构建链**：tsdown 复制 harness `packages/client/tsdown.client.ts` 语义（`__ModuleLoader__.load` banner、CSS Modules lightningcss 内联、平台模块 external 表、bundle purity gate）。
- **消费方契约**：`conversation.updateQueue / cancel / send / input.for(actx).notify / actions.setDraft`（官方 ui-conversation service，api-proxy.ts 核实）。
- **编辑区自动扩展**：`resizeEditor`（steer-queue-dock.tsx 导出的纯函数）把 textarea 高度重置后按 `scrollHeight` 生长，CSS `max-height` 封顶后内部滚动。

## 真实环境验证（Windows，2026-08-17）

`dsh web` 真实启动后浏览器端到端验证，全程控制台零应用错误：

| 验证项 | 结果 |
|---|---|
| 插件装配 | 组合树含 `input-traffic` 行；插件页签「已挂载已启用」；`/plugins/dsh-input-traffic/client.js` 200 |
| 设置行隐藏 | 设置面板「繁忙时 Enter 键行为」行不存在（DOM 全量搜索零匹配） |
| 红色 now | 打断后消息立即被处理：agent 明确回复被打断消息并继续；无滞留中间态 |
| 黄色 next + 绿色撤回 | 插话后点绿收回排队，消息回到等待区 |
| 冻结 / 恢复 | 当前轮次自然完成不打断、队列冻结保存、横幅提示；恢复后 FIFO 全部处理完成 |
| 队列编辑（多行 / 失败退回） | 组件测试覆盖（61 项全绿）；真实环境复核待做 |

## 参考

- [dsh-plugin-creation-convention.md](../dsh-plugin-creation-convention.md)（workspace 根部）——本插件遵循的 dsh 插件创建流程规约
- 语义参考：[dsh-traffic-light](https://github.com/yimeng-dev/dsh-traffic-light)（Session 运行状态红绿灯提示）
- 吸收来源：[dsh-auto-continue](https://github.com/HsiangNianian/dsh-auto-continue)（MIT, v0.8.1）——中断检测与续跑的纯逻辑来源
- harness 锚点：`packages/client/AGENTS.md`、`packages/client/tsdown.client.ts`、`packages/client/web/src/platform.ts`、`packages/bundle/web-app/cordis.patch.yml`、`packages/client/ui-conversation/src/client/queue/QueueDock.tsx`、`packages/host/apiproxy/src/api-proxy.ts`

## License

MIT
