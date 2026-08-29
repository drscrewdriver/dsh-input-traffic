<p align="center">
  <strong>DeepSeek Harness Web GUI 向け三段階入力交通管制</strong>
</p>
<p align="center">
  <a href="README.en.md">English</a> · <a href="README.md">中文</a> · <strong>日本語</strong> · <a href="README.ko.md">한국어</a>
</p>
<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img src="https://camo.githubusercontent.com/2c11fb2e0e14bb9985c5acbe61123a7441c5ee63aa27fa6e04e2a707ebfd6022/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6473682d2d706c7567696e2d72656164792d3437384342463f6c6f676f3d646565707365656b266c6f676f436f6c6f723d7768697465" alt="dsh-plugin" style="max-width: 100%;">
  <img alt="Public beta" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
</p>

# dsh-input-traffic

- [English README](./README.en.md)
- [中文 README](./README.md)
- [日本語 README](./README.ja.md)
- [한국어 README](./README.ko.md)
- [Installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

> **互換性について：** `ja` と `ko` の辞書は同梱されていますが、現在の公式 DSH リリースは `LocaleRuntime` 経由で `zh` と `en` のみを提供しています。純正 DSH で `ja` または `ko` を選択すると `locale "<id>" is not registered` で失敗します。公式 DSH が locale ID を追加するまで利用できません。上級ユーザーは DSH フォークを保守し、`packages/client/locale/src/locale-settings.ts` の `LOCALE_IDS` と `packages/client/locale/src/client/index.ts` の `LOCALES` ラベルを更新し、コア辞書とテストを追加して再ビルド・実行してください。このプラグインだけでは DSH のグローバル locale 一一覧を拡張できません。

> エージェントがビジーなとき、「中断」か「キュー」の二択ではありません：赤は即座に中断して送信、黄は次のターンに挿入、green は最後までキューイング——3 段階が共存します。DeepSeek のピーク課金時間帯に近づいたら、ワンクリックでセッションを凍結し、オフピーク時に再開します。

`dsh plugin` コマンドで组装 + バンドルパッチで装配する cordis クライアントプラグイン。dsh のソース変更も PR も不要です。

> 💡 **「セッション凍結」が推奨される理由**：DeepSeek は 2026-08-17 から**峰谷課金**を開始しました——ピーク時間帯（北京時間 9:00-12:00、14:00-18:00）の単価はオフピーク（その他の時間帯、昼間・夜間・週末・祝日を含む）の **2 倍**です。長時間実行されるセッションが高価な窗口を跨ぐ場合、手動で凍結して API 消費を一時停止し、オフピーク時に再開することで、費用を最大 **50%** 削減できます。
>
> **推奨セットアップ**：**リマインダー**プラグイン（[dsh-notify](https://github.com/zhengjy01/dsh-notify) など、凍結/再開のタイミングをデスクトップ通知）と**課金統計**プラグイン（[dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage)、[dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker)、[dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance) など、凍結前後の実際の支出を確認）を組み合わせ、「リマインド → 凍結 → オフピーク再開 → 精算」の節約ループを実現します。

## 機能一覧

- **3 段階の挿入が共存**：エージェントがビジーなとき、すべての入力はまず待機エリアに入り、会話に入るタイミングを選択できます——「中断」か「キュー」の単一選択ではありません：
  - 🔴 **赤（now）**：現在のターンを中断して即座に送信——実行中の生成が停止し、メッセージがエージェントにより即座に処理されて応答されます；
  - 🟡 **黄（next）**：次の自然なターンに挿入——現在のアクション（ツール呼び出し/実行中の生成）が完了してから挿入；
  - 🟢 **緑（later）**：ロジック全体の実行完了後に入力——キューで待機し、前の入力のすべてのアクションが完了してから処理（デフォルト）。
- **黄色は取り消し可能**：挿入済み（黄色）のメッセージに緑ボタンを押すと、挿入を取り消してキューに戻せます。
- **キュー内容は編集可能**：キューに入っているメッセージは直接編集できます——マルチラインエディタはコンテンツに応じて自動拡張され、長いメッセージも完全に表示されます（Enter で保存 / Shift+Enter で改行 / Esc でキャンセル）；**コンポーザに送り直して編集**も可能です。
- **キュー管理**：待機エリアのメッセージは**上へ/下へ移動**して順序を変更、削除、および「取り消して全消去」ができます。
- **編集でコンテンツを失わない**：保存に失敗した場合（エージェントが既にメッセージを取得済み）、編集内容は自動的にコンポーザに戻ります。
- **ピーク時間ク時間帯の凍結**：入力ボックス右側の「セッション凍結」ボタン——DeepSeek のピーク課金時間帯（9:00-12:00、14:00-18:00）に近づいたら、API 消費を一時停止：現在のターンが自然に完了してから暂停、未送信キューは凍結保存；「セッション再開」でオフピーク時に処理を継続。
- **セッション隔離凍結**：凍結キューは **sessionId で隔離**——あるセッションの凍結は他のセッションに影響しません（独立した frozen フラグと detached キュー）。
- **公式動作の上書き**：プラグイン有効時、公式設定パネルの「ビジー時の Enter キー動作」設定行は非表示になります（Enter 行為は緑キューに固定）。
- **日夜自動適応**：キュー枠と凍結ボタンはすべて dsh 公式セマンティックトークン（`--dsw-alias-*`）を使用し、システムダークモード / dsh ダークテーマに自動追従します。

## 3 段階のセマンティクス

| 段階 | 色 | セマンティクス | 底層メカニズム（dsh 既存 RPC 組み合わせ） |
|---|---|---|---|
| **later**（デフォルト） | 緑 | キュー：前の入力のすべてのアクションが完了してから処理；挿入済み（黄色）メッセージに緑 = **挿入取り消し、キューに戻す** | Enter デフォルト queue → `agent.followup()`（next-turn）；取り消し = `updateQueue(remove)` + `send(text)` |
| **next** | 黄 | 次の自然なターンに挿入：現在のアクションが完了してから | `updateQueue(id, { kind: 'steer' })` → `agent.steer()`（next-step バウンダリ） |
| **now** | 赤 | 中断して送信：現在のターンを停止し、メッセージは即座に処理 | `cancel()` → `updateQueue/remove`（inbox の重複挿入拒否を回避）→ `send(text)`（再送信、ドライバーを即座に起動） |

## セッション凍結 / 再開（ピーク時間帯の一時停止）⭐ 推奨

> **節約の位置づけ**：これは本プラグインの DeepSeek 峰谷課金（2026-08-17 発効）に対する**コア推奨機能**です——ピーク時間帯の単価は倍増、オフピーク時は半額。手動凍結で緊急でない生成を「一時停止」し、オフピーク時に再開することで、高価な窗口を直接回避します。
>
> **推奨セットアップ**：**リマインダー**プラグイン（[dsh-notify](https://github.com/zhengjy01/dsh-notify)）ピーク出入り時に通知；**課金統計**プラグイン（[dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage)、[dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker)、[dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)）凍結前後の実際の支出を確認。

- **凍結**：現在のターンは**中断されず**、自然に完了してから一時停止；キューは凍結と**疎結合**——凍結はエージェントの消費（実行/挿入/追加）のみを停止し、待機エリアは表示されたまま**完全に操作可能**（順序変更、編集、削除、赤/黄/緑の挿入段階設定）；
- **再開**：（修正済みの）キューが再送信され、**各エントリは予定された段階で実行**（赤=中断して即座に処理、黄=挿入、緑=キュー）；エージェントは FIFO 継続；
- **セッション隔離**：凍結状態と detached キューは **sessionId で分離**（`Map<sessionId, …>`）——セッション A の凍結はセッション B のバナー/ボタン/キューに影響しません；
- **エンジン**：凍結 = `updateQueue(remove)` で各行を分離（段階のコピーはプラグイン store にセッションごと保存）、現在のターンが pending なしで自然に停止；再開 = まず `sessionGuard.resume(sessionId)`、その後 `send(text)` で再送信してドライバーを起動（赤段階は `cancel()` の後に送信）；
- 注意：画像などの非テキスト内容を含むキューイング済みメッセージは再送信できず、凍結時にキューから解放されます（復元されません）。

### dsh-session-guard によるセッション級ロック

凍結ボタンは **sessionGuard ブリッジ**（`POST /session-guard/rpc { action: stopNextTurn|resume, sessionId }`）を介してサービス側の**セッション級ロック**にハンドオフします。同時にコンポーザブロック（`conversation.blocks.set`）を raise し、入力ボックスが inert になり、Enter が会話に漏れなくなります。

## キュー管理

待機エリアの各行（未凍結時）は以下の操作を提供：

| 操作 | 説明 |
|---|---|
| 上へ/下へ移動 | FIFO 順序を再構築（画像メッセージがキューにある場合は無効） |
| **ドラッグで並べ替え** | 行をドラッグしてターゲット位置に移動（ネイティブ HTML5 DnD） |
| コンポーザに送り直して編集 | メッセージ内容をコンポーザドラフトに戻し、キューから削除 |
| 編集/削除 | マルチラインエディタで直接編集/メッセージ取消 |
| 赤/黄/緑プランニング | 「3 段階のセマンティクス」参照 |
| 取り消して全消去 | 2 段階確認後、実行停止＋全キュー削除 |

## 日夜モード（ダーク自動適応）

キュー枠と凍結ボタンは dsh 公式セマンティックトークン（`--dsw-alias-*`）を引用し、ダークモードで**ダークグレー背景＋白文字反転**に自動切替。設定不要。

## インストール

```sh
# 方式一：npm からインストール（推奨、安定版）
dsh plugin --profile web add dsh-input-traffic -w

# 方式二：GitHub から直接インストール（drscrewdriver フォーク専用）
dsh plugin --profile web add github:drscrewdriver/dsh-input-traffic#main

# 方式三：ローカルパスで装配
# dsh plugin --profile web add /absolute/path/to/dsh-input-traffic -w

# 確認
dsh web --dump-config | grep -B1 -A2 'input-traffic'

# dsh web 再起動（必須！）
dsh web
```

> ⚠️ **GitHub ネットワーク到達性**：github: 直接インストールは github.com への接続が必要です。ネットワーク制限がある場合はプロキシまたはミラーアクセラレータを設定してください。

> **供应链冷却期**：pnpm 11 の `minimumReleaseAge` ポリシーにより、新規公開版が `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` でブロックされることがあります。`~/.dsh/profiles/web/pnpm-workspace.yaml` の `minimumReleaseAgeExclude` にバージョンを追加してください。

詳細は [INSTALL.ja.md](./INSTALL.ja.md) を参照。

## 開発（TDD + Lint）

```sh
npm run tdd        # vitest watch：変更で再実行、赤→緑ループ
npm run lint       # ESLint flat config
npm run lint:fix   # 自動修正
npm run verify     # 一体化ゲート：lint + test + build + verify-assembly
```

## 使い方

1. エージェントがビジーなとき直接入力して送信——メッセージは**待機エリアに入ります**（デフォルト緑キュー）；
2. メッセージにプランニングボタンを押します：
   - 🟡 黄 = 挿入——現在のアクション完了後に挿入；
   - 🔴 赤 = 中断——現在のアクションを即座に停止、メッセージは即座に処理；
   - 🟢 緑 = キューを維持（デフォルト）；挿入済みメッセージに緑 = 取り消してキューに戻す；
3. 順序変更/再編集：上へ下へ移動、コンポーザに送り直し、またはマルチラインインラインエディタ（Enter 保存、Shift+Enter 改行）；
4. **節約の鍵（推奨）**：ピーク時間帯（9:00-12:00、14:00-18:00）に近づいたら、「セッション凍結」を押して一時停止；オフピーク時に「セッション再開」で継続。

## よくある質問

### 中断後にメッセージに応答がない / 会話が停止する

歴史的問題（修正済み）。原因：harness の inbox は同じメッセージの重複挿入を拒否します。中断後に元のメッセージを直接ステアすると `"message is already pending"` で拒否され、メッセージがキューに滞留してエージェントが停止します。現在の実装は `cancel → remove → resend`（新しいメッセージとして再送信）です。まだ発生する場合は、プラグインを最新にビルドして dsh web を再起動してください。

### 編集保存に失敗した後、コンテンツはどこへ？

失われません。保存に失敗した場合（エージェントが既にメッセージを取得済み）、編集内容は自動的にコンポーザに戻り「編集失敗、内容はコンポーザに戻されました」という通知が表示されます。コンポーザに既にドラフトがある場合は上書きされません。

### 設定パネルに「ビジー時の Enter キー動作」がない

正常です——プラグインが上書きした後、その設定行は非表示になり、Enter 行為は緑キューに固定されます。

### 凍結後にキューイングされたメッセージが消えた

正常です——凍結はキューをプラグイン store に保存します（セッションごと隔離、待機エリアから凍結リストに移動）。再開後に再表示されます。**ページを更新すると凍結キューは失われます**——凍結中に更新しないでください。

### 上へ/下へボタンが使用不可

キューに画像などの非テキストメッセージが含まれている場合、並べ替えは無効になります（画像メッセージは再送信不可）。コンポーザに送り直して編集も同様です。

## アンインストール

```sh
dsh plugin --profile web remove dsh-input-traffic
```

再起動後、公式のキュー dock と「ビジー時の Enter キー動作」設定行が復元されます。

## 互換性とプライバシー

- DeepSeek Harness と web プロフィールが必要です。Windows / macOS / Linux の dsh web で検証済み。
- プラグインは純ブラウザ側（クライアント）プラグインです。すべての操作は dsh 既存の RPC を介して行われ、**公式ソースは変更しません**。
- プラグインはセッション内容以外のデータを読み取ったりアップロードしません。凍結キューはブラウザメモリにのみ保存されます。

## drscrewdriver DSH Plugin Family

本プロジェクトは [drscrewdriver](https://github.com/drscrewdriver) がメンテナンスする DSH プラグインシリーズの一つです：

| プラグイン | 一言説明 |
|---|---|
| **[dsh-input-traffic](https://github.com/drscrewdriver/dsh-input-traffic)** | DSH Web GUI ビジー時入力キュー：3 段階交通管制、ドラッグ並べ替え、セッション凍結 |
| **[dsh-session-guard](https://github.com/drscrewdriver/dsh-session-guard)** | ピーク自動セッションゲート：週末モード + ピーク自動暂停 + セッション級ロック + バックエンド自動リトライ |
| [dsh-thinking-levels](https://github.com/drscrewdriver/dsh-thinking-levels) | ラウンド単位 reasoning_effort 制御：Auto スケジューリングまたは手動固定 |
| [dsh-seatbelt-sandbox](https://github.com/drscrewdriver/dsh-seatbelt-sandbox) | macOS Seatbelt サンドボックスアダプタ |
| [dsh-switch-search](https://github.com/drscrewdriver/dsh-switch-search) | サイドバー会話検索強化 |

## ライセンス

MIT
