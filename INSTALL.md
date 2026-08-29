# Installation Guide (Official DSH CLI)

This guide uses only the official DSH `dsh plugin` command. The command installs the dependency into a profile and synchronizes `dsh.profile.bundles`. Do not replace it with plain `npm install`, direct `pnpm add` in the profile, or manual edits to the profile manifest.

- [English installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 설치 안내](./INSTALL.ko.md)
- [English README](./README.en.md)
- [中文 README](./README.md)
- [日本語 README](./README.ja.md)
- [한국어 README](./README.ko.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

The placeholders in this guide are:

- `<profile>`: the DSH profile to modify, usually `web`;
- `dsh-input-traffic`: the npm package and runtime plugin ID.

## 0. Prerequisites and profile discovery

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
dsh --version
ls "${DSH_HOME:-$HOME/.dsh}/profiles"
```

Use the profile named by your running DSH process. `web` is common, but the active `--profile` argument is authoritative.

## 1. Official installation

Install the latest version:

```bash
dsh plugin --profile <profile> add dsh-input-traffic -w
```

(The `-w` flag is required when the profile is a pnpm workspace root, as `web` is.)

Install the current release explicitly:

```bash
dsh plugin --profile <profile> add dsh-input-traffic@0.2.9 -w
```

The official CLI updates the profile dependency, lockfile, and `dsh.profile.bundles` automatically. Do not add a manual YAML row.

### Supply-chain cooling period

The dsh runtime uses pnpm 11, whose `minimumReleaseAge` policy may block a freshly published version with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`. Add the version to `minimumReleaseAgeExclude` in `~/.dsh/profiles/web/pnpm-workspace.yaml`:

```yaml
minimumReleaseAgeExclude:
  - dsh-input-traffic@0.2.9
```

## 2. Upgrade

Upgrade to the latest registry version:

```bash
dsh plugin --profile <profile> update dsh-input-traffic -w
```

Restart DSH for host changes and refresh the Web page for client changes.

## 3. Local-path / link: registration (alternative)

For development or offline installs, register the plugin from a local checkout:

```bash
#    ~/.dsh/profiles/web/package.json dependencies:
#      "dsh-input-traffic": "link:<absolute path to dsh-input-traffic>"
#    ~/.dsh/profiles/web/cordis.patch.yml:
#      - insert:
#          - id: input-traffic
#            name: dsh-input-traffic
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

Or use the official CLI with a local path (no network needed):

```bash
dsh plugin --profile <profile> add /absolute/path/to/dsh-input-traffic -w
```

## 4. Verify installation

Check the dependency and installed version:

```bash
grep -n "dsh-input-traffic" \
  "${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/package.json"
node -p "require('${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/node_modules/dsh-input-traffic/package.json').version"
```

Check the official composition:

```bash
dsh --profile <profile> --dump-default-config
```

It must contain:

```yaml
- id: input-traffic
  name: dsh-input-traffic
```

## 5. Verify the plugin

Restart DSH, then refresh the Web page. In a session, verify:

1. The three-tier planning dock appears in the waiting area;
2. The "Freeze session" button is visible on the composer's right;
3. The official "busy-Enter behavior" settings row is hidden;
4. While the agent is busy, sending a message places it in the waiting area with red/yellow/green planning buttons.

## Japanese and Korean support status

The plugin ships `ja` and `ko` dictionaries, but the current official DSH release exposes only `zh` and `en` through `LocaleRuntime`. On stock DSH, selecting Japanese or Korean fails with `locale "<id>" is not registered`.

To use them before official support lands, maintain a DSH fork and update:

- `packages/client/locale/src/locale-settings.ts`: add `ja` and `ko` to `LOCALE_IDS`.
- `packages/client/locale/src/client/index.ts`: add `{ id: 'ja', label: '日本語' }` and `{ id: 'ko', label: '한국어' }` to `LOCALES`.
- Add the corresponding core dictionaries and tests, then rebuild and run the forked DSH.

A plugin-only change cannot extend DSH's global locale list.

## 6. Troubleshooting

| Symptom | Action |
| --- | --- |
| `dsh` is not found | Install or enable the official DSH CLI. |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | Add the version to `minimumReleaseAgeExclude` in the profile's `pnpm-workspace.yaml`. |
| Plugin shows as "disabled/unmounted" with no error | Check the profile composition. |
| Client entry missing from `__DSH_BOOT__` | Confirm `exports["./client"]` exists and the host fiber was established. |
| Freeze/resume buttons not working | Ensure session-guard is installed if using session-level locking; the plugin operates fail-open when session-guard is absent. |
| Stale client bundle | Hard-refresh the browser (Ctrl+Shift+R) after an upgrade. |

## 7. Remove

Use the official command:

```bash
dsh plugin --profile <profile> remove dsh-input-traffic
```

Restart DSH afterwards to restore the official queue dock and the "busy-Enter behavior" settings row.
