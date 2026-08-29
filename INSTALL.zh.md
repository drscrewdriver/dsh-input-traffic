# 安装指南（官方 DSH CLI）

本指南只使用官方 `dsh plugin` 命令。该命令会把依赖装进 profile 并同步 `dsh.profile.bundles`。不要用普通 `npm install`、在 profile 里直接 `pnpm add` 或手工编辑 profile 清单代替。

- [安装指南](./INSTALL.zh.md)
- [English installation guide](./INSTALL.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [中文 README](./README.md)
- [English README](./README.en.md)
- [日本語 README](./README.ja.md)
- [한국어 README](./README.ko.md)
- [版本更新日志](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

本指南中的占位符：

- `<profile>`：要修改的 DSH profile，通常是 `web`；
- `dsh-input-traffic`：npm 包名与运行时插件 ID。

## 0. 前置检查与 profile 确认

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
dsh --version
ls "${DSH_HOME:-$HOME/.dsh}/profiles"
```

使用你正在运行的 DSH 进程对应的 profile。`web` 很常见，但以实际 `--profile` 参数为准。

## 1. 官方安装

安装最新版本：

```bash
dsh plugin --profile <profile> add dsh-input-traffic -w
```

（当 profile 是 pnpm workspace root 时必须带 `-w`，`web` 就是。）

显式安装当前发布版：

```bash
dsh plugin --profile <profile> add dsh-input-traffic@0.2.9 -w
```

官方 CLI 会自动更新 profile 依赖、锁文件与 `dsh.profile.bundles`。不要手工追加 YAML。

### 供应链冷却期

dsh 运行环境使用 pnpm 11，其 `minimumReleaseAge` 策略可能拦截刚发布的版本，报 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`。把版本加入 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude`：

```yaml
minimumReleaseAgeExclude:
  - dsh-input-traffic@0.2.9
```

## 2. 升级

升级到 registry 最新版本：

```bash
dsh plugin --profile <profile> update dsh-input-traffic -w
```

宿主侧改动需重启 DSH；浏览器侧刷新 Web 页面。

## 3. 本地路径 / link: 注册（备选）

开发或离线安装时，可以从本地检出注册插件：

```bash
#    ~/.dsh/profiles/web/package.json dependencies 增加：
#      "dsh-input-traffic": "link:<dsh-input-traffic 的绝对路径>"
#    ~/.dsh/profiles/web/cordis.patch.yml：
#      - insert:
#          - id: input-traffic
#            name: dsh-input-traffic
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

或用官方 CLI 加本地路径（无需网络）：

```bash
dsh plugin --profile <profile> add /dsh-input-traffic 的绝对路径/ -w
```

## 4. 验证安装

检查依赖与安装版本：

```bash
grep -n "dsh-input-traffic" \
  "${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/package.json"
```

检查官方组合配置：

```bash
dsh --profile <profile> --dump-default-config
```

应包含：

```yaml
- id: input-traffic
  name: dsh-input-traffic
```

## 5. 验证插件

重启 DSH 后刷新 Web 页面。在会话中验证：

1. 等待区出现三档规划 dock；
2. 输入框右侧显示「冻结会话」按钮；
3. 公式设置面板的「繁忙时 Enter 键行为」设置行已隐藏；
4. 智能体忙碌时发送消息，消息进入等待区并显示红/黄/绿规划按钮。

## 日语与韩语支持状态

插件自带 `ja` 与 `ko` 字典，但当前官方 DSH 只通过 `LocaleRuntime` 暴露 `zh` 和 `en`。在原版 DSH 上选择日语或韩语会报 `locale "<id>" is not registered`。

官方支持落地前要使用它们，请维护 DSH fork 并更新：

- `packages/client/locale/src/locale-settings.ts`：把 `ja` 与 `ko` 加入 `LOCALE_IDS`。
- `packages/client/locale/src/client/index.ts`：在 `LOCALES` 中加入 `{ id: 'ja', label: '日本語' }` 与 `{ id: 'ko', label: '한국어' }`。
- 补齐对应的核心字典与测试，然后重新构建并运行 fork 版本。

仅修改插件无法扩展 DSH 的全局 locale 列表。

## 6. 排查

| 症状 | 处理 |
| --- | --- |
| 找不到 `dsh` 命令 | 安装或启用官方 DSH CLI。 |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | 把版本加入 profile 的 `pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude`。 |
| 插件显示「已停用/未挂载」且无错误 | 检查 profile 组合。 |
| client 入口不在 `__DSH_BOOT__` | 确认 `exports["./client"]` 存在且 host fiber 已建立。 |
| 冻结/恢复按钮不工作 | 如使用会话级锁定，确保 session-guard 已安装；未安装时插件以 fail-open 方式运行。 |
| 浏览器显示旧 bundle | 升级后硬刷新（Ctrl+Shift+R）。 |

## 7. 卸载

使用官方命令：

```bash
dsh plugin --profile <profile> remove dsh-input-traffic
```

重启后，公式队列 dock 与「繁忙时 Enter 键行为」设置行将恢复。
