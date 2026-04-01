# 04. UI·스타일 마이그레이션 (디자인 토큰 + CSS Modules + Radix)

현재는 전역 [`styles.css`](../../styles.css) 한 파일에 레이아웃·컴포넌트·트리·모달·테이블이 모두 정의되어 있습니다. 목표는 **CSS 커스텀 프로퍼티(디자인 토큰)** 로 의미를 고정하고, **CSS Modules**로 슬라이스·컴포넌트 스타일을 나누며, 상호작용·접근성는 **Radix UI Primitives**로 올리는 것입니다.

**본 프로젝트 결정:** Tailwind와 shadcn/ui(공식 Tailwind 기반 스택)는 사용하지 않는다. [execution-plan.md](./execution-plan.md) Phase 3과 동일 선상에서 읽는다.

## 원칙

1. **토큰 우선:** 색·간격·타이포·반경·그림자는 `:root`(및 선택적 테마)의 `--token`으로만 정의하고, 모듈에서는 `var(--token)`으로 참조한다.
2. **CSS Modules가 기본:** 레이아웃·컴포넌트 변형은 `*.module.css`에 둔다. 비즈니스 화면 전용 규칙을 전역 CSS에 쌓지 않는다.
3. **Radix + Modules:** Dialog, Select 등은 `@radix-ui/react-*`로 마크업·접근성·키보드를 맡기고, 시각은 동일 슬라이스의 module에서 토큰으로 스타일한다. 단순 폼은 네이티브 `button`/`input` + Modules로 시작해도 된다.
4. **전역 CSS 최소화:** `reset` / `body` / 토큰 파일 import 정도만 `app/styles/global.css` 등에 유지한다.

## `styles.css` 구역별 분해 가이드

레거시 클래스를 React 쪽으로 옮길 때의 매핑이다.

| 대략적 구역                                  | 용도          | 제안 위치                                                                |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| 기본·타이포·색 변수                          | 문서 전체 톤  | `app/styles/tokens.css`(또는 `shared/styles/tokens.css`)에 `--*` 로 이전 |
| `.app-shell`, `.sidebar`, `.main`, `.topbar` | 앱 셸         | `widgets/app-shell/ui/AppShell.module.css`                               |
| `.nav-link`, `.workspace-tab`                | 탭·내비       | `Tabs`(Radix) + module 또는 순수 module                                  |
| `.btn`, `.pill`, `.input`, `.textarea`       | 폼 요소       | `shared/ui` 또는 feature별 module + 필요 시 Radix                        |
| `.stat-card`, `.panel`, `.board-*`           | 대시보드·칸반 | `widgets/dashboard-summary`, `widgets/workspace-board` 각 module         |
| `.item-list`, `.list-item`, `.detail-*`      | Items 뷰      | `widgets/items-split-view` + `features/item-detail` 일부                 |
| `.tree-*`, 드래그 상태 클래스                | 트리          | `widgets/item-tree-explorer` 전용 module (DnD 시각 유지)                 |
| `.modal-*`, `.import-*`                      | 모달          | Radix `Dialog` + module (오버레이·패널 레이아웃)                         |
| `.progress-table`, `.import-table`           | 테이블        | 시맨틱 `table` + module (또는 Radix와 조합)                              |

## Radix 도입 우선순위 (권장)

1. **Dialog** — 새 항목, 일괄등록, 확인 모달
2. **Select** — 필터·상세·모달 셀렉트
3. **Tabs** — Workspaces 상단 탭 (선택)
4. **DropdownMenu / AlertDialog** — 삭제 확인 등 `prompt`/`confirm` 대체 검토
5. **ScrollArea** — 긴 목록·트리 (선택)
6. 그 외 **Label** 등 필요 시 패키지 단위 추가

버튼·텍스트 입력은 초기에 네이티브 + 토큰·module만으로 충분할 수 있다.

## 트리·DnD

- HTML5 DnD 유지 또는 `@dnd-kit/core` 등으로 이전.
- 시각 클래스(`.dragging`, `.drop-before`, `.drop-inside`, `.drop-after`)는 **module에 동일 의미**로 옮기고, 가능하면 `data-state`와 토큰 기반 색으로 정리한다.

## 접근성

- 모달: 포커스 트랩, `aria-labelledby`, 닫기 — Radix Dialog가 기본 제공.
- 트리: `role="tree"`·키보드 탐색은 후속 과제로 [06-risks-and-testing.md](./06-risks-and-testing.md) 체크리스트에 반영.

## 에셋

- `seol-logo.png` — `public/` 또는 `shared/assets`로 이동 후 import 경로 통일.

## 참고 (채택하지 않는 스택)

- **Tailwind + shadcn:** 문서·블로그에서 자주 보이는 조합이나, 본 저장소 실행 플랜과 충돌하므로 **가이드로 따르지 않는다.**
