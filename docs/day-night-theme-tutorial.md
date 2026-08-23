# dsh 插件「字体颜色 / 配色跟随系统」改造教程

> 适用：任何 dsh client 插件想把自绘颜色改成**自动跟随系统深色模式 / dsh 暗色主题**。
> 以本仓库（dsh-input-traffic 0.2.8，分支 `feat/day-night-mode`）的队列框改造为完整样例。

## 一、背景：为什么插件颜色不随系统变

dsh 的主题系统在 `packages/client/ui-theme`：

- 用户主题偏好三选一：`light` / `dark` / **`system`**（默认 `system`，存在 user-settings）；
- `ThemeRuntime` 服务把 `system` 用 `matchMedia('(prefers-color-scheme: dark)')` 解析，发布 `theme/change`；
- `ThemePresenter` 把解析结果写到 DOM：`html { color-scheme }` + **`body[data-ds-dark-theme]`** + 内联语义 token 变量；
- 语义 token（`--dsw-alias-*`）定义在 `packages/client/ui-theme/src/styles/design-platform.css`，**深浅两套值挂在 `body` 上**，随 `body[data-ds-dark-theme]` 自动切换。

插件只要引用这些 `--dsw-alias-*` token，就会**自动**跟随主题，无需监听系统、无需 `@media`。

**常见坑**：插件里若用了 dsh 中不存在的 token（如本插件原先的 `--ds-color-surface` / `--ds-color-border` / `--ds-steer-*`），`var()` 会一直走浅色 fallback——系统切深色后插件依旧白底黑字。

## 二、诊断：确认 token 是否存在

在 dsh 源码里全局搜索（不要只信文档名）：

```sh
# 在 dsh 仓库根目录
grep -r -- "--ds-color-" packages/client   # 本插件旧 token：零命中 → 不存在
grep -r -- "--dsw-alias-" packages/client/ui-theme/src/styles/design-platform.css
```

`--ds-color-*` 零命中、`--dsw-alias-*` 有命中 → 插件应改用后者。

## 三、dsh 语义 token 映射表（核心）

所有 token 都在 `body` 上，插件组件是 `body` 后代，CSS Modules 直接可用。
（浅色值见 design-platform.css `body { ... }` 块，深色值见 `body[data-ds-dark-theme] { ... }` 块）

| 用途 | 语义 token | 浅色（body） | 深色（body[data-ds-dark-theme]） |
|---|---|---|---|
| 面板/区块底 | `--dsw-alias-bg-layer-1` | `bluish-00` 白 | `bluish-875` = `rgb(35,35,36)` 深灰 |
| 输入框/抬高层 | `--dsw-alias-bg-layer-2` | 白 | `rgb(44,44,46)` |
| 描边-弱/中/强 | `--dsw-alias-border-l2/l3/l4` | `rgba(0,0,0,.1/.12/.16)` | `rgba(255,255,255,.12/.16/.2)` |
| 主文字 | `--dsw-alias-label-primary` | `bluish-1000` 近黑 | `bluish-50` = `rgb(249,250,251)` 近白 |
| 次文字 | `--dsw-alias-label-secondary` | `bluish-700` | `bluish-300` |
| 弱文字 | `--dsw-alias-label-tertiary` | `bluish-600` | `bluish-400` |
| hover 底 | `--dsw-alias-interactive-bg-hover` | `rgba(38,49,72,.06)` | `rgba(255,255,255,.08)` |
| 红（错误/打断） | `--dsw-alias-state-error-primary` | `red-600` | `red-400` = `rgb(242,90,90)` |
| 黄（警告/插话） | `--dsw-alias-state-warn-primary` | `amber-500` | `amber-500` |
| 绿（成功/排队） | `--dsw-alias-state-success-primary` | `green-500` | `green-500` |

> 三档色直接用 `state-*-primary`：dsh 深色盘已内置适配值，**对比度由官方保证**，无需自己算。

## 四、改造步骤

1. **找出所有自绘/不存在的 token 与硬编码色**：在插件 `src/` 里 grep `--ds-` 与裸 `rgba(#)` 颜色。
2. **按上表映射**，每个 `var()` **保留原浅色值作 fallback**（dsh 未注入 token 时外观与现状一致，零回归）：
   ```css
   /* 改造前 */
   .panel { background: var(--ds-color-surface, rgba(255, 255, 255, 0.8)); }
   .preview { color: var(--ds-color-text, #1f2937); }
   /* 改造后 */
   .panel { background: var(--dsw-alias-bg-layer-1, rgba(255, 255, 255, 0.8)); }
   .preview { color: var(--dsw-alias-label-primary, #1f2937); }
   ```
3. **不新增任何 `@media (prefers-color-scheme)`、不监听系统**——深浅完全交给 dsh 主题（用户可在设置里手动覆盖系统，跟随 `body[data-ds-dark-theme]` 才能兼顾）。
4. **`color-mix(in srgb, <token> X%, transparent)` 打底**的底色会自动适应深浅，不用改；只改前景色/描边引用的 token。
5. **jsdom 不执行 CSS media query**，颜色切换无法在单测断言；用 `npm run verify` 保证门禁，深色观感用真实 `dsh web` 复核。

## 五、验证

```sh
npm run verify    # lint + 43 测试 + build + 12 项装配断言（本仓库当前全绿）
```

真实环境复核（`dsh web` 启动后）：
1. 系统切深色（或 dsh 设置手动选暗色）→ 插件组件变**深灰底 + 白色反色字**，状态色可辨识；
2. 切回浅色 → 外观与改造前一致。

## 六、要点与坑

- 先 `grep` 确认 token 存在，不要凭命名猜测（`--ds-*` 与 `--dsw-*` 是两个体系）；
- 语义 token 在 `body` 上声明，别自己再在插件 `:root` 里重定义一遍（会打架）；
- 不要写死深浅两套值——那会脱离 dsh 主题、也覆盖不了用户手动选择；
- hover 用 `--dsw-alias-interactive-bg-hover` 而非自己调透明度；
- 需要「比面板略亮」的输入框底用 `bg-layer-2`（深色下比 layer-1 亮一档）。
