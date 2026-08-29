# インストールガイド（公式 DSH CLI）

このガイドは公式 `dsh plugin` コマンドのみを使用します。このコマンドは依存関係を profile にインストールし、`dsh.profile.bundles` を同期します。普通の `npm install`、profile での直接 `pnpm add`、profile マニフェストの手動編集で代用しないでください。

- [日本語インストールガイド](./INSTALL.ja.md)
- [English installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [日本語 README](./README.ja.md)
- [English README](./README.en.md)
- [中文 README](./README.md)
- [한국어 README](./README.ko.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

このガイドのプレースホルダー：

- `<profile>`：変更する DSH profile。通常は `web`；
- `dsh-input-traffic`：npm パッケージ名とランタイムプラグイン ID。

## 0. 前提と profile の確認

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
dsh --version
ls "${DSH_HOME:-$HOME/.dsh}/profiles"
```

実行中の DSH プロセスが使う profile を使用してください。`web` が一般的ですが、実際の `--profile` 引数が優先されます。

## 1. 公式インストール

最新版をインストール：

```bash
dsh plugin --profile <profile> add dsh-input-traffic -w
```

（profile が pnpm workspace root の場合は `-w` が必要です。`web` はそうです。）

現在のリリースを明示的にインストール：

```bash
dsh plugin --profile <profile> add dsh-input-traffic@0.2.9 -w
```

公式 CLI は profile の依存関係、ロックファイル、`dsh.profile.bundles` を自動更新します。手動で YAML を追加しないでください。

### サプライチェーン冷却期間

dsh ランタイムは pnpm 11 を使用し、`minimumReleaseAge` ポリシーが新規公開版を `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` でブロックすることがあります。`~/.dsh/profiles/web/pnpm-workspace.yaml` の `minimumReleaseAgeExclude` にバージョンを追加してください：

```yaml
minimumReleaseAgeExclude:
  - dsh-input-traffic@0.2.9
```

## 2. アップグレード

registry の最新版へアップグレード：

```bash
dsh plugin --profile <profile> update dsh-input-traffic -w
```

ホスト側の変更は DSH を再起動、ブラウザ側は Web ページをリフレッシュしてください。

## 3. ローカルパス / link: 登録（代替）

開発用やオフラインインストールでは、ローカルチェックアウトから登録できます：

```bash
#    ~/.dsh/profiles/web/package.json dependencies:
#      "dsh-input-traffic": "link:<dsh-input-traffic の絶対パス>"
#    ~/.dsh/profiles/web/cordis.patch.yml:
#      - insert:
#          - id: input-traffic
#            name: dsh-input-traffic
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

または公式 CLI でローカルパスを追加（ネットワーク不要）：

```bash
dsh plugin --profile <profile> add /dsh-input-traffic の絶対パス/ -w
```

## 4. インストールの検証

依存関係とインストール済みバージョンを確認：

```bash
grep -n "dsh-input-traffic" \
  "${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/package.json"
```

公式構成を確認：

```bash
dsh --profile <profile> --dump-default-config
```

以下が含まれている必要があります：

```yaml
- id: input-traffic
  name: dsh-input-traffic
```

## 5. プラグインの検証

DSH を再起動し、Web ページをリフレッシュしてください。セッションで以下を確認：

1. 待機エリアに 3 段階プランニング dock が表示される；
2. コンポーザ右側に「セッション凍結」ボタンが表示される；
3. 公式設定パネルの「ビジー時の Enter キー動作」設定行が非表示になる；
4. エージェントがビジーなときメッセージを送ると、待機エリアに赤/黄/緑プランニングボタン付きで配置される。

## 日本語と韓国語のサポート状況

プラグインには `ja` と `ko` の辞書が含まれていますが、現在の公式 DSH リリースは `LocaleRuntime` 経由で `zh` と `en` のみを提供します。純正 DSH で日本語または韓国語を選択すると `locale "<id>" is not registered` で失敗します。

公式サポートが来る前に使うには、DSH フォークを保守して更新してください：

- `packages/client/locale/src/locale-settings.ts`：`LOCALE_IDS` に `ja` と `ko` を追加。
- `packages/client/locale/src/client/index.ts`：`LOCALES` に `{ id: 'ja', label: '日本語' }` と `{ id: 'ko', label: '한국어' }` を追加。
- 対応するコア辞書とテストを追加し、フォーク版を再ビルドして実行。

プラグイン単体では DSH のグローバル locale 一覧を拡張できません。

## 6. トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `dsh` が見つからない | 公式 DSH CLI をインストール/有効化。 |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | profile の `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` にバージョンを追加。 |
| プラグインが「無効/未マウント」でエラーなし | profile 構成を確認。 |
| client エントリが `__DSH_BOOT__` にない | `exports["./client"]` が存在し、host fiber が確立されていることを確認。 |
| 凍結/再開ボタンが動作しない | セッション級ロックを使用する場合は session-guard がインストールされているか確認。未インストール時は fail-open で動作。 |
| ブラウザが古い bundle を表示 | アップグレード後にハードリフレッシュ（Ctrl+Shift+R）。 |

## 7. アンインストール

公式コマンドを使用：

```bash
dsh plugin --profile <profile> remove dsh-input-traffic
```

再起動後、公式キュー dock と「ビジー時の Enter キー動作」設定行が復元されます。
