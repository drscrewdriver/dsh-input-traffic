# 설치 안내(공식 DSH CLI)

이 가이드는 공식 `dsh plugin` 명령만 사용합니다. 이 명령은 의존성을 profile에 설치하고 `dsh.profile.bundles`를 동기화합니다. 일반 `npm install`, profile에서 직접 `pnpm add`, profile 매니페스트 수동 편집으로 대체하지 마세요.

- [한국어 설치 안내](./INSTALL.ko.md)
- [English installation guide](./INSTALL.md)
- [中文安装指南](./INSTALL.zh.md)
- [日本語インストールガイド](./INSTALL.ja.md)
- [한국어 README](./README.ko.md)
- [English README](./README.en.md)
- [中文 README](./README.md)
- [日本語 README](./README.ja.md)
- [Changelog](./CHANGELOG.md)
- [日本語 changelog](./CHANGELOG.ja.md)
- [한국어 changelog](./CHANGELOG.ko.md)

이 가이드의 자리표시자:

- `<profile>`: 수정할 DSH profile. 보통 `web`;
- `dsh-input-traffic`: npm 패키지 이름이자 런타임 플러그인 ID.

## 0. 사전 확인과 profile 확인

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
dsh --version
ls "${DSH_HOME:-$HOME/.dsh}/profiles"
```

실행 중인 DSH 프로세스가 사용하는 profile을 사용하세요. `web`이 일반적이지만 실제 `--profile` 인자가 우선합니다.

## 1. 공식 설치

최신 버전 설치:

```bash
dsh plugin --profile <profile> add dsh-input-traffic -w
```

(profile이 pnpm workspace root면 `-w`가 필요합니다. `web`이 그렇습니다.)

현재 릴리스 명시적 설치:

```bash
dsh plugin --profile <profile> add dsh-input-traffic@0.2.9 -w
```

공식 CLI는 profile 의존성, 잠금 파일, `dsh.profile.bundles`를 자동으로 갱신합니다. 수동으로 YAML을 추가하지 마세요.

### 공급망 쿨링 기간

dsh 런타임은 pnpm 11을 사용하며 `minimumReleaseAge` 정책이 새로 게시된 버전을 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`으로 차단할 수 있습니다. `~/.dsh/profiles/web/pnpm-workspace.yaml`의 `minimumReleaseAgeExclude`에 버전을 추가하세요:

```yaml
minimumReleaseAgeExclude:
  - dsh-input-traffic@0.2.9
```

## 2. 업그레이드

registry 최신 버전으로 업그레이드:

```bash
dsh plugin --profile <profile> update dsh-input-traffic -w
```

호스트 변경은 DSH 재시작, 브라우저 측은 웹 페이지 새로고침이 필요합니다.

## 3. 로컬 경로 / link: 등록(대안)

개발 또는 오프라인 설치에서는 로컬 체크아웃에서 등록할 수 있습니다:

```bash
#    ~/.dsh/profiles/web/package.json dependencies:
#      "dsh-input-traffic": "link:<dsh-input-traffic 절대 경로>"
#    ~/.dsh/profiles/web/cordis.patch.yml:
#      - insert:
#          - id: input-traffic
#            name: dsh-input-traffic
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

또는 공식 CLI로 로컬 경로 추가(네트워크 불필요):

```bash
dsh plugin --profile <profile> add /dsh-input-traffic 절대 경로/ -w
```

## 4. 설치 검증

의존성과 설치 버전 확인:

```bash
grep -n "dsh-input-traffic" \
  "${DSH_HOME:-$HOME/.dsh}/profiles/<profile>/package.json"
```

공식 구성 확인:

```bash
dsh --profile <profile> --dump-default-config
```

다음이 포함되어야 합니다:

```yaml
- id: input-traffic
  name: dsh-input-traffic
```

## 5. 플러그인 검증

DSH를 재시작하고 웹 페이지를 새로고침하세요. 세션에서 다음을 확인:

1. 대기 영역에 3단계 계획 dock이 표시됨;
2. 컴포저 우측에 "세션 동결" 버튼이 표시됨;
3. 공식 설정 패널의 "바쁜 동안 Enter 키 동작" 설정 행이 숨겨짐;
4. 에이전트가 바쁠 때 메시지를 보내면 대기 영역에 빨간/노란/초록 계획 버튼과 함께 배치됨.

## 일본어·한국어 지원 상태

플러그인에는 `ja`와 `ko` 사전이 포함되어 있지만, 현재 공식 DSH 릴리스는 `LocaleRuntime`을 통해 `zh`와 `en`만 제공합니다. 순정 DSH에서 일본어 또는 한국어를 선택하면 `locale "<id>" is not registered` 오류가 발생합니다.

공식 지원 전에 사용하려면 DSH 포크를 유지하며 업데이트하세요:

- `packages/client/locale/src/locale-settings.ts`: `LOCALE_IDS`에 `ja`와 `ko` 추가.
- `packages/client/locale/src/client/index.ts`: `LOCALES`에 `{ id: 'ja', label: '日本語' }`와 `{ id: 'ko', label: '한국어' }` 추가.
- 해당 핵심 사전과 테스트를 추가하고 포크 버전을 다시 빌드하여 실행.

플러그인만으로는 DSH의 전역 locale 목록을 확장할 수 없습니다.

## 6. 트러블슈팅

| 증상 | 조치 |
| --- | --- |
| `dsh`를 찾을 수 없음 | 공식 DSH CLI를 설치/활성화. |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` | profile의 `pnpm-workspace.yaml` `minimumReleaseAgeExclude`에 버전 추가. |
| 플러그인이「비활성화/미마운트」이며 오류 없음 | profile 구성을 확인. |
| client 항목이 `__DSH_BOOT__`에 없음 | `exports["./client"]`가 있고 host fiber가 생성되었는지 확인. |
| 동결/재개 버튼이 작동하지 않음 | 세션급 잠금을 사용하는 경우 session-guard가 설치되어 있는지 확인. 미설치 시 fail-open으로 동작. |
| 브라우저가 오래된 bundle 표시 | 업그레이드 후 하드 새로고침(Ctrl+Shift+R). |

## 7. 제거

공식 명령 사용:

```bash
dsh plugin --profile <profile> remove dsh-input-traffic
```

재시작 후 공식 대기열 dock과 "바쁜 동안 Enter 키 동작" 설정 행이 복원됩니다.
