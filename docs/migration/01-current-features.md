# 01. 현재 구현 기능 인벤토리

`index.html` + `app.js` 기준으로 구현된 기능을 카테고리별로 정리합니다. 마이그레이션 시 **동작 동등성** 검증용 체크리스트로 사용합니다.

---

## A. 앱 셸·내비게이션

| ID  | 기능                                             | 구현 메모                          | 포팅 시 확인                          |
| --- | ------------------------------------------------ | ---------------------------------- | ------------------------------------- |
| A1  | 사이드바 브랜드(마크·이름·부제)                  | `.brand`, `.brandLetterMark`       | 어드민 T / 프로젝트 P 글리프          |
| A2  | 프로젝트 카드(이름·메타)                         | 정적 HTML                          | `state.project`와 연동 여부 결정      |
| A3  | 의사결정 원칙 목록                               | 정적 `<ul>`                        | 콘텐츠 유지                           |
| A4  | 푸터 "Prototype v7"                              | 정적                               | `STORAGE_KEY` v6와 불일치 — 정리 권장 |
| A5  | 네비: Dashboard / Workspaces / Items / Item Tree | `data-view`, `switchView`          | 라우트 또는 탭 상태                   |
| A6  | 활성 뷰 영속화                                   | `state.ui.activeView`, `saveState` | 새 앱에서 동일 키 또는 라우트         |

---

## B. 대시보드 (`dashboardView`)

| ID  | 기능                 | 구현 메모                                            | 포팅 시 확인          |
| --- | -------------------- | ---------------------------------------------------- | --------------------- |
| B1  | 통계 카드 4종        | `renderStats`: 전체, P0, 논의 중, 확정·잠금          | 집계 로직 동일        |
| B2  | P0 긴급 목록         | `priority === "P0"` && `status !== "확정"`, 최대 6건 | 개수·정렬             |
| B3  | 긴급 카드 클릭       | `data-open-item` → `selectItem(..., openItemsView)`  | 선택 ID + 뷰 전환     |
| B4  | 도메인별 진행 테이블 | `getStatusDoneCount`: 방향합의·확정을 완료로 간주    | 퍼센트·바 너비        |
| B5  | 최근 변경 이력(전역) | `history` 시간 역순 8건                              | `renderRecentHistory` |

---

## C. 워크스페이스 칸반 (`workspaceView`)

| ID  | 기능                   | 구현 메모                          | 포팅 시 확인               |
| --- | ---------------------- | ---------------------------------- | -------------------------- |
| C1  | 탭 전환                | `information_request` / `decision` | `state.ui.activeWorkspace` |
| C2  | 유형별 설명 문구       | `workspaceMeta` innerText          | 복사 가능                  |
| C3  | 컬럼 3개               | 논의 / 방향합의 / 확정             | `WORKSPACE_CONFIG`         |
| C4  | 보드에 표시되는 아이템 | `item.type === workspace`          | 유형 필터 일치             |
| C5  | 카드 클릭              | `data-open-item` → Items + 선택    | 동일                       |

---

## D. 아이템 목록·상세 (`itemsView`)

| ID  | 기능                                   | 구현 메모                                                          | 포팅 시 확인                      |
| --- | -------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| D1  | 통합 검색                              | `itemMatchesSearch`: 제목·코드·설명·담당·회신·최종확인·도메인 라벨 | 대소문자·공백 무시 `normalizeKey` |
| D2  | 필터 셀렉트                            | 유형·도메인·상태                                                   | `getFilteredItems`                |
| D3  | 목록 렌더                              | 선택 항목 `active`                                                 | `state.ui.selectedItemId`         |
| D4  | 선택 변경 시                           | `renderDetail`, `renderTreeExplorer`                               | 트리 하이라이트 동기              |
| D5  | 상세: 코드 표시                        | 읽기 전용                                                          |                                   |
| D6  | 상세: 제목                             | textarea, `autoResizeDetailTitle`                                  | 입력 시 높이                      |
| D7  | 상세: 유형                             | disabled input (라벨 문자열)                                       | 생성 후 변경 불가 전제            |
| D8  | 상세: 도메인·우선순위·상태·담당·마감일 | select/input                                                       |                                   |
| D9  | 상세: 설명·고객회신·최종확인           | textarea                                                           |                                   |
| D10 | 상태 옵션 동적 제한                    | `getStatusOptionsForItem`                                          | 논의/방향합의/확정 규칙           |
| D11 | 확정·잠금 시 필드 비활성               | `setDetailEditableState`                                           | 저장 버튼도 disabled              |
| D12 | 저장                                   | `saveSelectedItem`, 변경 시 `item.updated`                         | 제목 필수                         |
| D13 | 확정 처리 토글                         | 방향합의 → 확정만 허용, 해제 시 방향합의                           | `item.locked` / `item.unlocked`   |
| D14 | 코멘트 추가                            | 작성자·본문 필수, `comment.added` 히스토리                         | 시간순 목록                       |
| D15 | 아이템별 히스토리                      | `getHistory` 역순                                                  |                                   |
| D16 | 필터 결과에 선택 없을 때               | `ensureSelectedItemVisible` 첫 항목 선택                           |                                   |

---

## E. 아이템 트리 (`itemTreeView`)

| ID  | 기능                      | 구현 메모                                                                | 포팅 시 확인                           |
| --- | ------------------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| E1  | 도메인 계층 + 아이템      | `getDomainTreeNodes`                                                     | order·parentId                         |
| E2  | 트리 검색                 | `treeQuery`, 매칭 시 브랜치 표시, 검색 중 전부 펼침                      |                                        |
| E3  | 도메인 접기/펼치기        | `expandedDomainIds`                                                      |                                        |
| E4  | 도메인 이름 변경          | `prompt`, 동명 충돌 방지                                                 |                                        |
| E5  | 하위 도메인 생성          | `prompt` + `createDomain({ parentId })`                                  | 부모 펼침                              |
| E6  | 도메인 삭제               | confirm, 하위 승격, 아이템 fallback 도메인 이동, `item.domainReassigned` | 최소 1 도메인                          |
| E7  | 신규 도메인(루트)         | 툴바 입력 + 버튼 / Enter                                                 | `createDomain`                         |
| E8  | 전체 접기·펼치기          | `toggleAllDomains`                                                       |                                        |
| E9  | 요약 텍스트               | 도메인 수·아이템 수                                                      |                                        |
| E10 | 도메인 DnD                | 형제 순서, before/inside/after, 루트 드롭존                              | 순환 이동 금지 `canMoveDomainToParent` |
| E11 | 아이템 DnD                | 도메인 행에 드롭 → `moveItemToDomain`                                    | `item.domainMoved`                     |
| E12 | 아이템 상세보기 토글      | `treePreviewItemId`, 최종확인값 프리뷰                                   |                                        |
| E13 | 아이템 삭제               | confirm, 코멘트·히스토리 제거                                            | 선택 ID 정리                           |
| E14 | 더보기                    | Items 뷰로 이동·선택                                                     |                                        |
| E15 | 도메인 행 클릭(이름 링크) | `focusDomain` / toggle                                                   | UX 유지                                |

---

## F. 모달·일괄 작업

| ID  | 기능                   | 구현 메모                                             | 포팅 시 확인        |
| --- | ---------------------- | ----------------------------------------------------- | ------------------- |
| F1  | 새 항목 모달 열기/닫기 | 오버레이 클릭 닫기                                    |                     |
| F2  | 신규 필드              | 유형·도메인·우선순위·담당·마감일·제목·설명            |                     |
| F3  | 자동 코드              | `getNextCode` 접두 IR/D/R/ISS/CR + 일련번호           |                     |
| F4  | 생성 후                | Items 뷰, 선택·히스토리 `item.created`                |                     |
| F5  | 일괄등록 모달          | CSV 파일 또는 붙여넣기                                |                     |
| F6  | 구분자 추정            | 탭·세미콜론·콤마 `guessDelimiter`                     |                     |
| F7  | 헤더 행 감지           | `hasHeaderRow` + `HEADER_ALIASES`                     | 한글 헤더           |
| F8  | 고정 순서 행           | 헤더 없을 때 `FIXED_IMPORT_ORDER`                     |                     |
| F9  | 미리보기               | `prepareImport`, 최대 50행 표시                       | 실행 버튼 활성 조건 |
| F10 | 실행                   | create/update, 확정 항목 skip, 배치 내 code 중복 오류 | alert 요약          |
| F11 | 도메인 해석            | `resolveDomainValue({ createIfMissing })`             |                     |
| F12 | 템플릿 CSV 다운로드    | UTF-8 BOM                                             |                     |

---

## G. 글로벌 액션(탑바)

| ID  | 기능              | 구현 메모                  | 포팅 시 확인      |
| --- | ----------------- | -------------------------- | ----------------- |
| G1  | JSON보내기        | 전체 `state` JSON 파일     | 파일명 타임스탬프 |
| G2  | 샘플데이터 초기화 | confirm → `createSeedData` |                   |

---

## H. 도메인 모델·비즈니스 규칙(코어)

| ID  | 규칙                                                                                                                                                         | 구현 위치 요약                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | --- |
| H1  | Item 필드: id, code, type, domain, title, description, priority, status, owner, dueDate, clientResponse, finalConfirmedValue, isLocked, createdAt, updatedAt | `normalizeState`, 폼                                    |
| H2  | Domain 필드: id, name, parentId, order                                                                                                                       | `normalizeDomains`                                      |
| H3  | Comment: id, itemId, author, body, createdAt                                                                                                                 |                                                         |
| H4  | History: id, itemId, eventType, summary, actor, createdAt                                                                                                    |                                                         |
| H5  | 상태 정규화                                                                                                                                                  | `normalizeStatusValue`, 알 수 없으면 `논의`             |
| H6  | 확정과 잠금                                                                                                                                                  | `status === "확정"` 또는 기존 `isLocked` → 저장 시 동기 |
| H7  | 도메인 alias                                                                                                                                                 | `BASE_DOMAIN_DEFS`, import·검색                         |
| H8  | 타입·상태 import alias                                                                                                                                       | `TYPE_VALUE_ALIASES`, `STATUS_VALUE_ALIASES`            |
| H9  | 날짜 정규화                                                                                                                                                  | `normalizeDateInput`, 엑셀 시리얼                       |     |

### 히스토리 `eventType` (코드 기준)

- `item.created`, `item.updated`, `item.locked`, `item.unlocked`
- `comment.added`
- `item.domainMoved`, `item.domainReassigned`
- `item.bulkCreated`, `item.bulkUpdated`
- 시드 데이터 예시: `item.agreed` (런타임에서 항상 발생하진 않을 수 있음)

---

## I. 크로스컷팅·기술 부채

| ID  | 내용                                                                             | 권장                                                        |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| I1  | `normalizeDomainOrders` 함수 중복 정의 (`app.js` 약 418행·468행)                 | 단일 구현으로 통합                                          |
| I2  | `updateDomainManagerSelect`, `moveDomainPosition`, `deleteManagedDomain` 빈 구현 | 제거 또는 구현                                              |
| I3  | XSS                                                                              | `escapeHtml` → React에서는 텍스트 노드·정책 명시            |
| I4  | 접근성                                                                           | 역할·라벨·포커스 트랩·키보드 — Radix/네이티브 패턴으로 개선 |
| I5  | 렌더링 패턴                                                                      | 전역 `innerHTML` + 핸들러 재바인딩                          | React에서는 상태 단일 소스 |

---

## 마이그레이션 완료 기준(요약)

- 위 표 **포팅 시 확인** 열을 기준으로 화면별 수동·자동 테스트를 통과할 것.
- `localStorage` 직렬화 형식은 [02-data-model.md](./02-data-model.md)와 호환되거나 마이그레이션 어댑터를 제공할 것.
