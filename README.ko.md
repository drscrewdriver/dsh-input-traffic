<p align="center">
  <strong>DeepSeek Harness Web GUI용 3단계 입력 트래픽 제어</strong>
</p>
<p align="center">
  <a href="README.en.md">English</a> · <a href="README.md">中文</a> · <a href="README.ja.md">日本語</a> · <strong>한국어</strong>
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

> **호환성 참고:** `ja`와 `ko` 사전이 포함되어 있지만, 현재 공식 DSH 릴리스는 `LocaleRuntime`을 통해 `zh`와 `en`만 제공합니다. 순정 DSH에서 `ja` 또는 `ko`를 선택하면 `locale "<id>" is not registered` 오류가 발생합니다. 공식 DSH가 해당 locale ID를 추가할 때까지 사용할 수 없습니다. 고급 사용자는 DSH 포크를 유지하면서 `packages/client/locale/src/locale-settings.ts`의 `LOCALE_IDS`와 `packages/client/locale/src/client/index.ts`의 `LOCALES` 라벨을 업데이트하고 핵심 사전과 테스트를 추가한 뒤 다시 빌드하여 실행할 수 있습니다. 이 플러그인만으로는 DSH의 전역 locale 목록을 확장할 수 없습니다.

> 에이전트가 바쁠 때 "중단" 또는 "대기" 둘 중 하나가 아닙니다: 빨간색은 즉시 중단 후 전송, 노란색은 다음 턴에 삽입, 초록색은 끝까지 대기 — 3단계가 공존합니다. DeepSeek 피크 과금 시간대가临近하면 원클릭으로 세션을 동결하고 오피크에 재개합니다.

`dsh plugin` 명령으로 조립 + 번들 패치로 장착하는 cordis 클라이언트 플러그인. dsh 소스 변경이나 PR이 필요 없습니다.

> 💡 **"세션 동결"이 권장되는 이유**: DeepSeek는 2026-08-17부터 **피크/오피크 과금**을 시행합니다 — 피크 시간대(베이징 시간 9:00-12:00, 14:00-18:00) 단가는 오피크(나머지 시간대, 주간·야간·주말·공휴일 포함)의 **2배**입니다. 장시간 실행되는 세션이 비싼 시간대를跨越하면, 수동으로 동결하여 API 소비를 일시 정지하고 오피크에 재개하면 비용을 최대 **50%** 절감할 수 있습니다.
>
> **권장 구성**: **알림** 플러그인([dsh-notify](https://github.com/zhengjy01/dsh-notify), 동결/재개 시점 데스크톱 알림)과 **과금 통계** 플러그인([dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage), [dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker), [dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance), 동결 전후 실제 지출 확인)을 함께 사용하여 "알림 → 동결 → 오피크 재개 → 정산" 절약 루ープ를 실현합니다.

## 기능概要

- **3단계 삽입 공존**: 에이전트가 바쁠 때 모든 입력은 먼저 대기 영역에 들어가고, 대화에 들어가는 시기를 선택할 수 있습니다 — "중단" 또는 "대기" 단일 선택이 아닙니다:
  - 🔴 **빨간색(now)**: 현재 턴을 중단하고 즉시 전송 — 실행 중인 생성이 중지되고 메시지가 에이전트에 의해 즉시 처리되어 응답됩니다;
  - 🟡 **노란색(next)**: 다음 자연스러운 턴에 삽입 — 현재 액션(도구 호출/실행 중인 생성)이 완료된 후 삽입;
  - 🟢 **초록색(later)**: 논리 전체 실행 후 입력 — 대기열에서 이전 입력의 모든 액션이 완료된 후 처리(기본값).
- **노란색은 취소 가능**: 이미 삽입된(노란색) 메시지에 초록 버튼을 누르면 삽입을 취소하고 대기열로 되돌릴 수 있습니다.
- **대기열 내용 편집 가능**: 대기열에 있는 메시지를 직접 편집할 수 있습니다 — 멀티라인 에디터가 내용에 따라 자동 확장되어 긴 메시지도 완전히 표시됩니다(Enter 저장 / Shift+Enter 줄바꿈 / Esc 취소).
- **대기열 관리**: 대기영역의 메시지는 **위로/아래로 이동**하여 순서 변경, 삭제, "취소 후 전체 지우기"가 가능합니다.
- **편집 시 내용 손실 없음**: 저장 실패 시(에이전트가 이미 메시지를 가져간 경우), 편집 내용은 자동으로 컴포저로 돌아갑니다.
- **피크 시간 동결**: 입력창 우측 "세션 동결" 버튼 — DeepSeek 피크 과금 시간대(9:00-12:00, 14:00-18:00)에 가까워지면 API 소비를 일시 정지: 현재 턴이 자연스럽게 완료된 후 일시 정지, 미전송 대기열은 동결 저장; "세션 재개"로 오피크에 처리 계속.
- **세션 격리 동결**: 동결 대기열은 **sessionId로 격리** — 한 세션의 동결은 다른 세션에 영향을 주지 않습니다.
- **공식 동작 오버라이드**: 플러그인 활성 시 공식 설정 패널의 "바쁜 동안 Enter 키 동작" 설정 행이 숨겨집니다(Enter 동작은 초록 대기열로 고정).
- **주야 자동 적응**: 대기열 프레임과 동결 버튼은 모두 dsh 공식 시맨틱 토큰(`--dsw-alias-*`)을 사용하며 시스템 다크모드 / dsh 다크 테마를 자동 추적합니다.

## 3단계 의미론

| 단계 | 색상 | 의미론 | 하위 메커니즘(dsh 기존 RPC 조합) |
|---|---|---|---|
| **later** (기본값) | 초록 | 대기: 이전 입력의 모든 액션이 완료된 후 처리; 삽입된(노란색) 메시지에 초록 = **삽입 취소, 대기열로 복귀** | Enter 기본 queue → `agent.followup()` (next-turn); 취소 = `updateQueue(remove)` + `send(text)` |
| **next** | 노랑 | 다음 자연스러운 턴에 삽입: 현재 액션 완료 후 | `updateQueue(id, { kind: 'steer' })` → `agent.steer()` (next-step 경계) |
| **now** | 빨강 | 중단 후 전송: 현재 턴 중지, 메시지 즉시 처리 | `cancel()` → `updateQueue(remove)` (inbox 중복 삽입 거부 회피) → `send(text)` (재전송, 드라이버 즉시 깨우기) |

## 세션 동결 / 재개 (피크 시간대 일시정지) ⭐ 권장

> **절약 포지셔닝**: 본 플러그인의 DeepSeek 피크/오피크 과금(2026-08-17 시행)에 대한 **핵심 권장 기능**입니다 — 피크 시간대 단가 2배, 오피크는 반값. 수동 동결로 긴급하지 않은 생성을 "일시정지"하고 오피크에 재개하면 비싼 시간대를 직접 회피합니다.
>
> **권장 구성**: **알림** 플러그인([dsh-notify](https://github.com/zhengjy01/dsh-notify)) 피크 진입/이탈 시 알림; **과금 통계** 플러그인([dsh-deepseek-usage](https://github.com/yyb16yyb-hub/dsh-deepseek-usage), [dsh-cost-tracker](https://github.com/yflmq001/dsh-cost-tracker), [dsh-billing-balance](https://github.com/YZz-S/dsh-billing-balance)) 동결 전후 실제 지출 확인.

- **동결**: 현재 턴은 **중단되지 않고** 자연스럽게 완료된 후 일시정지; 대기열은 동결과 **분리** — 동결은 에이전트 소비(실행/삽입/추가)만 중지하고 대기 영역은 표시된 채 **완전히 조작 가능**;
- **재개**: (수정된) 대기열이 재전송되고 **각 항목은 예정된 단계로 실행** (빨강=중단 후 즉시 처리, 노랑=삽입, 초록=대기열); 에이전트는 FIFO 계속;
- **세션 격리**: 동결 상태와 분리된 대기열은 **sessionId로 격리** — 세션 A의 동결은 세션 B의 배너/버튼/대기열에 영향 없음;
- **엔진**: 동결 = `updateQueue/remove)`로 각 행 분리(단계별 복사본은 플러그인 store에 세션별 저장), 현재 턴이 pending 없이 자연 정지; 재개 = 먼저 `sessionGuard.resume(sessionId)`, 그 후 `send(text)`로 재전송하여 드라이버 깨우기(빨간 단계는 `cancel()` 후 전송);
- 주의: 이미지 등 비텍스트 내용이 포함된 대기열 메시지는 재전송 불가하며, 동결 시 대기열에서 해제됩니다(복원되지 않음).

## 대기열 관리

대기영역 각 행(미동결 시)은 다음 작업을 제공:

| 작업 | 설명 |
|---|---|
| 위로/아래로 이동 | FIFO 순서 재구성(이미지 메시지가 대기열에 있으면 비활성화) |
| **드래그로 재정렬** | 행을 드래그하여 대상 위치로 이동(네이티브 HTML5 DnD) |
| 컴포저로 되돌려 편집 | 메시지 내용을 컴포저 초안으로 복귀 |
| 편집/삭제 | 멀티라인 에디터로 직접 편집/취소 |
| 빨간/노란/초록 계획 | "3단계 의미론" 참조 |
| 취소 후 전체 지우기 | 2단계 확인 후 실행 중지 + 전체 대기열 삭제 |

## 주야 모드(자동 다크 적응)

대기열 프레임과 동결 버튼은 모두 dsh 공식 시맨틱 토큰(`--dsw-alias-*`)을 사용하며, 다크모드에서 **다크그레이 배경 + 흰색 반전 텍스트**로 자동 전환. 설정 불필요.

## 설치

```sh
# 방법 1: npm에서 설치(권장, 안정 버전)
dsh plugin --profile web add dsh-input-traffic -w

# 방법 2: GitHub에서 직접 설치(drscrewdriver 포크 전용)
dsh plugin --profile web add github:drscrewdriver/dsh-input-traffic#main

# 방법 3: 로컬 경로로 조립
# dsh plugin --profile web add /absolute/path/to/dsh-input-traffic -w

# 확인
dsh web --dump-config | grep -B1 -A2 'input-traffic'

# dsh web 재시작(필수!)
dsh web
```

> ⚠️ **GitHub 네트워크 도달성**: github: 직접 설치는 github.com 연결이 필요합니다. 네트워크 제한이 있는 경우 프록시 또는 미러 가속기를 설정하세요.

상세는 [INSTALL.ko.md](./INSTALL.ko.md)를 참조하세요.

## 개발(TDD + Lint)

```sh
npm run tdd        # vitest watch: 변경 시 재실행, 빨강→초록 루프
npm run lint       # ESLint flat config
npm run lint:fix   # 자동 수정
npm run verify     # 통합 게이트: lint + test + build + verify-assembly
```

## 사용법

1. 에이전트가 바쁠 때 직접 입력하여 전송 — 메시지는 **대기 영역에 진입**(기본 초록 대기열);
2. 메시지에 계획 버튼을 누릅니다:
   - 🟡 노랑 = 삽입 — 현재 액션 완료 후 삽입;
   - 🔴 빨강 = 중단 — 현재 액션을 즉시 중지, 메시지가 즉시 처리;
   - 🟢 초록 = 대기 유지(기본값); 삽입된 메시지에 초록 = 취소하여 대기열로 복귀;
3. 순서 변경/재편집: 위로/아래로 이동, 컴포저로 되돌리기, 또는 멀티라인 인라인 에디터(Enter 저장, Shift+Enter 줄바꿈);
4. **절약 핵심(권장)**: 피크 시간대(9:00-12:00, 14:00-18:00)에 가까워지면 "세션 동결"을 눌러 일시정지; 오피크에 "세션 재개"로 계속.

## 자주 묻는 질문

### 중단 후 메시지에 응답이 없음 / 대화 정지

과거 문제(수정 완료). 원인: harness inbox는 이미 대기 중인 메시지의 중복 삽입을 거부합니다. 중단 후 원본 메시지를 직접 steer하면 `"message is already pending"`으로 거부되어 메시지가 대기열에 고정되고 에이전트가 정지합니다. 현재 구현은 `cancel → remove → resend`(새 메시지로 재전송)입니다. 여전히 발생하면 플러그인을 최신 빌드하고 dsh web을 재시작하세요.

### 편집 저장 실패 후 내용은 어디로?

손실되지 않습니다. 저장 실패 시(에이전트가 이미 메시지를 가져간 경우), 편집 내용은 자동으로 컴포저로 돌아가 "편집 실패, 내용이 컴포저로 돌아갔습니다" 알림이 표시됩니다. 컴포저에 이미 초안이 있으면 덮어쓰지 않습니다.

### 설정 패널에 "바쁜 동안 Enter 키 동작"이 없음

정상입니다 — 플러그인이 오버라이드한 후 해당 설정 행이 숨겨지고 Enter 동작은 초록 대기열로 고정됩니다.

### 동결 후 대기열 메시지가 사라짐

정상입니다 — 동결은 대기열을 플러그인 store에 저장합니다(세션별 격리, 대기 영역에서 동결 리스트로 이동). 재개 후 다시 표시됩니다. **페이지 새로고침 시 동결 대기열은 손실됩니다** — 동결 중 새로고침하지 마세요.

### 위로/아래로 버튼 사용 불가

대기열에 이미지 등 비텍스트 메시지가 포함되어 있으면 재정렬이 비활성화됩니다(이미지 메시지는 재전송 불가). 컴포저로 되돌려 편집도 마찬가지.

## 제거

```sh
dsh plugin --profile web remove dsh-input-traffic
```

재시작 후 공식 대기열 dock과 "바쁜 동안 Enter 키 동작" 설정 행이 복원됩니다.

## 호환성 및 개인정보

- DeepSeek Harness와 web 프로필이 필요합니다. Windows/macOS/Linux dsh web에서 검증 완료.
- 플러그인은 브라우저 측(클라이언트) 전용 — 모든 작업은 dsh 기존 RPC를 통해 수행되며 **공식 소스를 변경하지 않습니다**.
- 플러그인은 세션 내용 이외의 데이터를 읽거나 업로드하지 않습니다. 동결 대기열은 브라우저 메모리에만 저장됩니다.

## drscrewdriver DSH Plugin Family

본 프로젝트는 [drscrewdriver](https://github.com/drscrewdriver)가 유지보수하는 DSH 플러그인 시리즈의 하나입니다:

| 플러그인 | 한 줄 설명 |
|---|---|
| **[dsh-input-traffic](https://github.com/drscrewdriver/dsh-input-traffic)** | DSH Web GUI 바쁜 시간 입력 대기열: 3단계 트래픽 제어, 드래그 재정렬, 세션 동결 |
| **[dsh-session-guard](https://github.com/drscrewdriver/dsh-session-guard)** | 피크 자동 세션 게이트: 주말 모드 + 피크 자동 일시정지 + 세션급 잠금 + 백엔드 자동 재시도 |
| [dsh-thinking-levels](https://github.com/drscrewdriver/dsh-thinking-levels) | 라운드별 reasoning_effort 제어: Auto 스케줄링 또는 수동 고정 |
| [dsh-seatbelt-sandbox](https://github.com/drscrewdriver/dsh-seatbelt-sandbox) | macOS Seatbelt 샌드박스 어댑터 |
| [dsh-switch-search](https://github.com/drscrewdriver/dsh-switch-search) | 사이드바 대화 검색 강화 |

## 라이선스

MIT
