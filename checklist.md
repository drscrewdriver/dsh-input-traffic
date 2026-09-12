# Checklist

## Must Pass（本分支交付门槛）
- [ ] 分支 `compat/0.1.5` 基于 main @ b5eccd3 创建
- [ ] `package.json`：version `0.2.12-beta.1`；`engines.dsh` = `>=0.1.5-alpha.1 <0.2.0-0`；全部 `@deepseek-ai/*` peer 区间同步收窄
- [ ] `dsh.plugin.json` version 同步为 `0.2.12-beta.1`
- [ ] `src/types/contracts.d.ts` 头部 supported segment 更新为 `>=0.1.5-alpha.1 <0.2.0-0`
- [ ] `src/client/index.ts` / `freeze-button.tsx` 双版本历史注释改写为 0.1.5 现状（无行为变更）
- [ ] README.md / README.en.md 兼容矩阵改为 0.1.5-only（0.1.2 用户指回 main 线 0.2.11.x）
- [ ] README 新增「0.1.5 已知回归」节：fork 继承队列 / Lexical IME / steer 边界 / combo 缓存（各附讨论链接）
- [ ] CHANGELOG.md（Unreleased → 0.2.12-beta.1 小节）+ CHANGELOG.ja.md / CHANGELOG.ko.md 同步
- [ ] `npm run verify` 全绿（lint + vitest + build + verify-assembly）
- [ ] git diff 确认 `lib/` 与 src 逻辑零改动（仅注释/元数据/文档）

## Should Pass（静态契约核对，无实机条件下）
- [ ] 三个 shadow slot key 与 0.1.5 slots.md 声明树逐字一致
- [ ] `session.updateQueue` / `prompt` / `cancel` remote 在 0.1.5 session.md 中存在
- [ ] bundle 运行时 require 清单（react / react/jsx-runtime / dsh-client-ui-primitives）均在 0.1.5 共享模块表
- [ ] examples/verify-assembly.mjs 输出 patch 为纯 insert

## 待实机回归（ blockers 交付后、用户装 0.1.5 实机时逐项打勾）
- [ ] 队列条三档（now/next/later）入队、拖拽排序、批量清空在 0.1.5-rc.2 正常
- [ ] busy 时 interject（steer）与 interrupt 按钮生效
- [ ] 冻结/恢复：composer block 生效（输入失效、恢复按钮可点）、safe_point 文本经 conversation.send 送达
- [ ] `input.for(actx).actions.setDraft` 回填草稿正常（重点验证 Lexical composer 下）
- [ ] `input.for(actx).notify` 通知条正常
- [ ] 设置页官方 busy-Enter 行被隐藏（`settings.general.item` + priority -1 shadow 有效）
- [ ] `settingsScope.bind('ui-conversation').set('busyEnter','queue')` 写入成功
- [ ] 从旧 profile 升级场景：强制刷新浏览器后插件树激活
