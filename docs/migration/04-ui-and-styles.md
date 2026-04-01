# 04. UI·스타일 마이그레이션 (CSS Modules + Shadcn)

현재는 전역 [`styles.css`](../../styles.css) 한 파일에 레이아웃·컴포넌트·트리·모달·테이블이 모두 정의되어 있습니다. 목표는 **CSS Modules(슬라이스/컴포넌트 단위)** 와 **Shadcn UI**의 조합입니다.

## 원칙

1. **Shadcn 우선:** 버튼, 입력, 다이얼로그, 셀렉트, 테이블 등은 Radix + Tailwind 기반 컴포넌트로 대체하고, 커스텀 간격·색만 토큰으로 맞춥니다.
2. **CSS Modules는 "남는 레이아웃·도메인 특화"에 사용:** 칸반 컬럼 그리드, 트리 들여쓰기(`--tree-depth`), 대시보드 카드 변형 등 Shadcn에 없는 패턴.
3. **전역 CSS 최소화:** `reset` / `body` / CSS 변수(테마) 정도만 `app` 레이어에 유지.

## `styles.css` 구역별 분해 가이드

아래는 파일을 읽으며 흔히 나뉘는 블록입니다(실제 클래스명은 소스 기준으로 재확인).

| 대략적 구역 | 용도 | 제안 위치 |
|-------------|------|-----------|
| 기본·타이포·색 변수 | 문서 전체 톤 | `app/styles/global.css` 또는 Tailwind theme extension |
| `.app-shell`, `.sidebar`, `.main`, `.topbar` | 앱 셸 | `widgets/app-shell/ui/AppShell.module.css` + Shadcn `Sheet`/`ScrollArea` 검토 |
| `.nav-link`, `.workspace-tab` | 탭·내비 | Shadcn `Tabs` / 커스텀 + module |
| `.btn`, `.pill`, `.input`, `.textarea` | 폼 요소 | Shadcn `Button`, `Input`, `Textarea`, `Badge` |
| `.stat-card`, `.panel`, `.board-*` | 대시보드·칸반 | `widgets/dashboard-summary`, `widgets/workspace-board` 각 module |
| `.item-list`, `.list-item`, `.detail-*` | Items 뷰 | `widgets/items-split-view` + `features/item-detail` 일부 |
| `.tree-*`, 드래그 상태 클래스 | 트리 | `widgets/item-tree-explorer` 전용 module (DnD 시각 유지) |
| `.modal-*`, `.import-*` | 모달 | Shadcn `Dialog` + module로 그리드만 |
| `.progress-table`, `.import-table` | 테이블 | Shadcn `Table` |

## Shadcn 도입 우선순위 (권장)

1. **Button, Input, Textarea, Label** — 폼·탑바 전반
2. **Dialog** — 새 항목, 일괄등록
3. **Select** — 필터·상세·모달의 셀렉트
4. **Tabs** — Workspaces 상단 탭 (선택)
5. **Table** — 도메인 진행, import 미리보기
6. **ScrollArea** — 긴 목록·트리
7. **DropdownMenu / AlertDialog** — 삭제 확인 등 `confirm` 대체 검토

## 트리·DnD

- HTML5 DnD는 그대로 두거나 `@dnd-kit/core` 등으로 이전할 수 있습니다.
- 시각 클래스(`.dragging`, `.drop-before`, `.drop-inside`, `.drop-after`)는 **module에 동일 이름을 유지**하거나 `data-state` + Tailwind로 옮기기 쉽게 정리합니다.

## Tailwind와 CSS Modules 공존

- Shadcn은 Tailwind 기반이므로 프로젝트에 **Tailwind 설정이 필수**입니다.
- 한 컴포넌트에서 `className`은 Tailwind, 레이아웃 그리드만 `styles.grid`처럼 module을 섞는 방식이 운영하기 쉽습니다.

## 접근성

- 모달: 포커스 트랩, `aria-labelledby`, 닫기 버튼 — Shadcn Dialog가 기본 제공.
- 트리: 트리 역할(`role="tree"`), 키보드 탐색은 마이그레이션 후속 과제로 체크리스트화 ([06-risks-and-testing.md](./06-risks-and-testing.md)).

## 에셋

- `seol-logo.png` — `public/` 또는 `shared/assets`로 이동 후 import 경로 통일.
