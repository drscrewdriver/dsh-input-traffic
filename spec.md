# Spec: dsh-input-traffic DSH 0.1.5 适配（分支 compat/0.1.5）

## 需求
- 新建分支 `compat/0.1.5`（基于 main @ b5eccd3），插件目标平台收窄为 **DSH 0.1.5+（0.1.5-only）**，不再承诺 0.1.2/0.1.3。
- 代码零结构性改动：三个 shadow slot（`conversation.input.dock` / `conversation.input.right` / `settings.general.item`）在 0.1.5 均保留；`conversation` 服务面（send/cancel/updateQueue/input.for/blocks.set）无破坏记录；类型镜像已对照 dsh-v0.1.5-rc.2。
- 元数据与文档全面切换到 0.1.5 分段：engines、peerDependencies、README 兼容矩阵（4 语言）、CHANGELOG（3 语言）、dsh.plugin.json 版本同步。
- 披露 0.1.5 已知回归对本插件场景的影响（fork 继承队列、Lexical IME、steer 抢占边界、client combo 缓存陈旧）。
- 无实机环境：所有运行时验证项明确标记为「待实机回归」，交付物只承诺 lint/test/build/assembly 通过 + 文档契约静态核对。

## 技术方案
1. **分支**：`git checkout -b compat/0.1.5`（基于 main）。
2. **版本**：package.json `0.2.12-beta.1`（沿用 0.2.11-beta.1 的"分段收窄=beta minor"惯例），dsh.plugin.json 同步。
3. **分段收窄**：
   - `engines.dsh`: `>=0.1.2-alpha.1 <0.2.0-0` → `>=0.1.5-alpha.1 <0.2.0-0`
   - 全部 `@deepseek-ai/*` peer 区间：`>=0.1.2-alpha.1 <0.2.0-0` → `>=0.1.5-alpha.1 <0.2.0-0`
4. **注释/契约头更新**（纯注释，无行为变更）：
   - `src/types/contracts.d.ts` 头部 supported segment 改为 `>=0.1.5-alpha.1 <0.2.0-0`，锚点说明保留（已对照 rc.2）。
   - `src/client/index.ts`、`src/client/freeze-button.tsx` 中 0.1.1/0.1.2 双版本历史注释改写为 0.1.5 现状描述。
5. **README 兼容矩阵**（README.md / README.en.md，ja/ko 若有对应小节同步）：支持表改为 `≥ 0.1.5-alpha.1 ✅`；新增「0.1.5 已知回归」小节（见 checklist）。
6. **CHANGELOG**：`Unreleased` 下新增 0.2.12-beta.1 小节，同步 ja/ko。
7. **验证**：`npm run verify`（lint + test + build + examples/verify-assembly.mjs）。

## 决策记录
| 选项 | 选择 | 理由 |
|------|------|------|
| 双版本同代码 vs 0.1.5-only | 0.1.5-only（用户确认） | 分支策略明确；main 留守 0.1.2 兼容线，compat/0.1.5 独立演进 |
| 版本号 0.2.12-beta.1 vs 0.3.0 | 0.2.12-beta.1 | 沿用 0.2.11-beta.1 收窄惯例，非功能大改 |
| peer 下限 0.1.5-alpha.1 vs 0.1.5-rc.1 | 0.1.5-alpha.1 | alpha.1 是 0.1.5 系列起点；实际安装面向 rc.1/rc.2 |
| 是否新增 dsh-client-store/connection peer | 不新增 | 插件运行时零值导入 @deepseek-ai/*，YAGNI |
| 是否为 fork 继承队列做插件侧缓解 | 不做代码缓解，仅文档披露 | #6314 是宿主 bug，插件无法可靠区分 fork 场景，等官方修复 |

## 约束
- 无 DSH 0.1.5 实机：`input.for(actx)`、`blocks.set`、dock props 三个面文档未记载，只能静态核对 + 标记待验证。
- 客户端 bundle 运行时仅 require react / react/jsx-runtime / dsh-client-ui-primitives，三者 0.1.5 共享模块表均在——bundle 本身无需改动。
- 不修改 `lib/`（构建产物）、不做 0.1.2 兼容层。
