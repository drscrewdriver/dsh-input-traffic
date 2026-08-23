<p align="center">
  <strong>给 DeepSeek Harness Web GUI 一个三档输入交通管制</strong>
</p>
<p align="center">
  <strong>中文</strong> · <a href="README.en.md">English</a>
</p>
<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img src="https://camo.githubusercontent.com/2c11fb2e0e14bb9985c5acbe61123a7441c5ee63aa27fa6e04e2a707ebfd6022/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6473682d2d706c7567696e2d72656164792d3437384342463f6c6f676f3d646565707365656b266c6f676f436f6c6f723d7768697465" alt="dsh-plugin" data-canonical-src="https://img.shields.io/badge/dsh--plugin-ready-478CBF?logo=deepseek&amp;logoColor=white" style="max-width: 100%;">
  <img alt="Public beta" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
 <a href="https://dshfind.com/zh/plugins/drscrewdriver/dsh-input-traffic?ref=badge"><img alt="dsh-input-traffic" src="https://dshfind.com/api/badge/drscrewdriver/dsh-input-traffic?lang=zh"></a>
</p>

# dsh-input-traffic

> 智能体忙碌时不再只有"打断"或"排队"二选一：红色打断立即输入、黄色下一轮插入、绿色排队到最后，三档并存；邻近 DeepSeek 高峰收费时段可一键冻结会话，错峰再恢复继续。

无需修改 dsh 源码、无需提 PR：`dsh plugin` 命令组装 + bundle patch 装配的 cordis client 插件。

> 💡 **为什么推荐「冻结会话」**：DeepSeek 已于 2026-08-17 实行**峰谷计费**——高峰时段（北京时间 9:00-12:00、14:00-18:00）单价为闲时（其余时段，含午间、夜间、周末与节假日）的 **2 倍**。长跑型会话若跨越高价窗口，手动冻结暂停 API 消耗、错峰再恢复，费用最多可省 **50%**。
>
> **目前建议搭配**：配合**一般提醒**插件（如 [dsh-notify](https://github.com/zhengjy01/dsh-notify)，到点桌面提醒「该冻结/该恢复」）与**计费统计**插件（如 [dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage)、[dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker)、[dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)，核对冻结前后的实际花费），形成「提醒 → 冻结 → 错峰恢复 → 对账」的省钱闭环。

## 它能做什么
<img width="1809" height="547" alt="image" src="https://github.com/user-attachments/assets/4a89687b-5444-4538-b1b2-f0fd093cdd10" />
<img width="1051" height="302" alt="image" src="https://github.com/user-attachments/assets/710a101e-9ba1-41f0-b74d-bb0ccca77928" />

- **三档插入并存**：智能体忙碌时，每一条输入都先进入等待区，再按需选择何时进入对话——不再只有一个"打断"或只有一个"排队"：
  - 🔴 **红色（now）**：打断当前轮次并立即输入——当前生成停止，消息作为新输入被 agent 立刻处理并回复；
  - 🟡 **黄色（next）**：下一自然轮插入——不打断当前执行，当前正在进行的动作（工具调用 / 本轮生成）结束后插入；
  - 🟢 **绿色（later）**：待整个逻辑执行完成后输入——排队等待，上一轮输入的所有动作都结束后再处理（默认状态）。
- **黄色可逆**：对已插话（黄色）的消息点绿色按钮，可撤销插入、收回排队状态。
- **排队内容可再编辑**：已经排在队列中的消息可以直接在队列里编辑——多行编辑区随内容自动扩展，长消息也能完整查看与修改（Enter 保存 / Shift+Enter 换行 / Esc 取消）；也可**打回输入框再编辑**（回填 composer 修改后重新发送）。
- **队列管理**：等待区的消息可以**上移 / 下移调整顺序**、删除，以及队列级「取消并清空」。
- **编辑不丢内容**：编辑保存失败（消息已被 agent 认领）时，编辑内容自动退回主输入框，不会丢失；主输入框已有内容时不覆盖。
- **高峰期冻结**：输入框右侧「冻结会话」按钮——邻近 DeepSeek 高峰收费时段（9:00-12:00、14:00-18:00）时主动暂停 API 消耗：当前轮次自然完成后暂停，未发送队列冻结保存；「恢复会话」后在非高价时间继续处理。
- **接管官方行为**：插件生效时，官方设置面板的「繁忙时 Enter 键行为」设置行不再显示（Enter 行为固定为绿色排队）。
- **日夜自动适配**：队列框与冻结按钮全部改用 dsh 官方语义 token（`--dsw-alias-*`），自动跟随系统深色模式 / dsh 暗色主题——深色下自动变为**深灰底 + 白色反色字**，无需任何设置（见「日夜模式」）。

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

## 日夜模式（自动适配深色）

队列框与冻结按钮的配色**不再使用自绘颜色**，全部改为引用 dsh 官方语义 token（`--dsw-alias-*`：`bg-layer-*` / `border-l*` / `label-*` / `interactive-bg-hover` / `state-success|warn|error-primary`）。这些 token 由 dsh 主题系统统一维护：

- **自动跟随**：dsh 默认主题偏好为「跟随系统」——系统切到深色模式（或在 dsh 设置里手动选暗色主题）时，`body[data-ds-dark-theme]` 生效，token 自动切换为深色盘，队列框变为**深灰底 + 白色反色字**，三档色用官方暗色适配值（对比度由 dsh 保证）；
- **无需配置**：插件本身不监听系统、不新增设置项——深浅完全交给 dsh 主题，白天外观保持不变；
- **范围**：等待区 dock（含冻结横幅 / 冻结列表）与输入框右侧「冻结会话」按钮。

## 安装

```sh
# 方式一：从 npm 安装（推荐，稳定发布）
#   （profile 是 pnpm workspace root，add 需带 -w 参数）
dsh plugin --profile web add dsh-input-traffic -w

# 方式二：GitHub 直装（drscrewdriver fork 专属，先试用新功能）
#   （本仓库未提交 lib/，装后需在 profile 内现场构建：
#    cd ~/.dsh/profiles/web/node_modules/dsh-input-traffic && npm install --legacy-peer-deps && npm run build）
dsh plugin --profile web add github:drscrewdriver/dsh-input-traffic#main

# 方式三：本地路径组装
# dsh plugin --profile web add /absolute/path/to/dsh-input-traffic -w

# 确认组合树包含新行
dsh web --dump-config | grep -B1 -A2 'input-traffic'

# 重启 dsh web —— 必做！运行中实例不热载 bundle 层
dsh web
```

> ⚠️ **GitHub 网络可达性**：github: 直装需要能连通 github.com；网络受限时请先配置可用代理或镜像加速，否则 add 会在拉取阶段卡住。

本地构建与测试：

```sh
npm install --legacy-peer-deps   # @deepseek-ai client 包链在 npm 上不完整，仅装工具链
npm run build                    # tsc（lib/types）+ tsdown（lib/index.js + lib/client.js）
node examples/verify-assembly.mjs  # 12 项装配断言
npm test                         # 36 项 vitest 组件测试
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
4. `npm run verify` 全绿后提交（lint + 36 测试 + 构建 + 12 项装配断言）。

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
| 队列编辑（多行 / 失败退回） | 组件测试覆盖（32 项全绿）；真实环境复核待做 |

## 参考

- [dsh-plugin-creation-convention.md](../dsh-plugin-creation-convention.md)（workspace 根部）——本插件遵循的 dsh 插件创建流程规约
- 语义参考：[dsh-traffic-light](https://github.com/yimeng-dev/dsh-traffic-light)（Session 运行状态红绿灯提示）
- harness 锚点：`packages/client/AGENTS.md`、`packages/client/tsdown.client.ts`、`packages/client/web/src/platform.ts`、`packages/bundle/web-app/cordis.patch.yml`、`packages/client/ui-conversation/src/client/queue/QueueDock.tsx`、`packages/host/apiproxy/src/api-proxy.ts`

## drscrewdriver DSH Plugin Family

本项目是 [drscrewdriver](https://github.com/drscrewdriver) 维护的 DSH 插件系列之一。如果这个对你有用，其他插件多半也有用：

| 插件 | 一句话描述 |
|---|---|
| **[dsh-input-traffic](https://github.com/drscrewdriver/dsh-input-traffic)** | DSH Web GUI 忙时输入队列：三档交通管制，拖拽重排，会话冻结 |
| [dsh-thinking-levels](https://github.com/drscrewdriver/dsh-thinking-levels) | 逐轮 reasoning_effort 控制：Auto 智能调度或手动固定档位 |
| [dsh-seatbelt-sandbox](https://github.com/drscrewdriver/dsh-seatbelt-sandbox) | macOS Seatbelt 沙箱适配器：libsandbox 原生 loader，接替弃用的 sandbox-exec |
| [dsh-switch-search](https://github.com/drscrewdriver/dsh-switch-search) | 侧边栏会话搜索增强：标题/内容切换，按用户/回复/工具筛选 |

## License

MIT

