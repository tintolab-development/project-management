# 07. 관점별 분리 — 공용 UI·유틸·훅·비즈니스 로직

마이그레이션을 진행하면서 `app.js`에 뭉쳐 있는 코드를 **어떤 기준으로** `shared` / `entities` / `features` / `widgets` 등으로 나눌지 정리한 문서입니다. [03-fsd-mapping.md](./03-fsd-mapping.md)의 폴더 배치와 함께 읽습니다.

---

## 1. 기존 문서에서 다루는 범위

| 문서 | 이 주제와의 관계 |
|------|------------------|
| [03-fsd-mapping.md](./03-fsd-mapping.md) | 슬라이스 **이름**과 레이어 역할. |
| [02-data-model.md](./02-data-model.md) | 상태·엔티티 필드. |
| **본 문서(07)** | **분리 판단 기준**, 공용 컴포넌트 vs 훅 vs 순수 함수, 추출 순서. |

전용 가이드는 기존에 없었으며, 본 파일이 그 역할을 합니다.

---

## 2. 네 가지 관점으로 나누기

### 2.1 공용 UI (`shared/ui` + 필요 시 Shadcn)

**넣을 것**

- 특정 도메인(Item/Domain) **이름·필드를 모르는** 컴포넌트
- 버튼·인풋 래퍼, 레이아웃 그리드, 스켈레톤, 빈 상태 플레이스홀더(문구는 props로)

**넣지 말 것**

- `item.code`, `status === "확정"` 같이 **프로젝트 도메인을 아는** 표시 → `entities` 쪽 `ui` 세그먼트

**판별 질문:** “다른 제품에도 그대로 쓸 수 있는가?” → Yes면 `shared/ui`.

---

### 2.2 순수 유틸·도메인 무관 로직 (`shared/lib`)

**넣을 것**

- `normalizeKey`, `clone`, `uniqueId`, CSV/TSV `parseDelimited`, `guessDelimiter`, `excelSerialToDate` 등 **입출력만 있고 React·스토어를 모르는** 함수
- 브라우저 API를 쓰더라도 **테스트하기 쉬운** thin wrapper (예: 파일을 텍스트로 읽기)

**넣지 말 것**

- `getItemById`, `normalizeDomains` 같이 **앱 데이터 모델에 묶인** 규칙 → `entities/*/model` 또는 `lib`

**판별 질문:** “인자만 주면 동일하게 동작하고, 전역 `state`를 읽지 않는가?” → Yes면 `shared/lib` 후보.

---

### 2.3 엔티티 단위 모델·표현·선택자 (`entities/*`)

**넣을 것**

- 타입, Zod 스키마, **정규화**(`normalizeDomains`, `normalizeStatusValue`), 정렬·필터 **순수** selector (`getFilteredItems`의 “아이템 배열 기준” 부분만 등)
- 도메인을 아는 **작은 UI:** `ItemPriorityBadge`, `StatusPill`, `DomainBreadcrumb` (props로 id/값만 받음)

**훅 위치:** 엔티티 데이터를 **읽기만** 하고 UI에 맞게 가공하는 훅은 `entities/*/lib` 또는 `entities/*/model` 옆 `useXxx`로 둘 수 있음. 다만 **스토어 갱신**이 섞이면 아래 2.4로 넘깁니다.

**판별 질문:** “Item/Domain/Comment/History **한 종류**의 규칙·표현인가?” → Yes면 `entities`.

---

### 2.4 사용자 시나리오·부수효과 (`features/*`)

**넣을 것**

- “저장”, “확정 토글”, “코멘트 추가”, “일괄 import 실행”, “도메인 DnD 후 커밋”처럼 **한 유스케이스**에 해당하는 로직
- **React 훅:** 스토어/컨텍스트를 구독하고 `dispatch`·`setState`·`mutate`를 호출하는 `useSaveItem`, `useBulkImport`, `useDomainTreeDnD` 등

**넣지 말 것**

- 범용 `useDebounce`, `useMediaQuery` → `shared/lib` (또는 외부 라이브러리)

**판별 질문:** “사용자 한 액션의 완결된 흐름인가?” 또는 “스토어/서버에 **쓰기**가 있는가?” → Yes면 `features`.

---

### 2.5 조합 전용 (`widgets` / `pages`)

**넣을 것**

- 여러 feature·entity UI를 **배치만** 하는 컨테이너
- 라우트 단위 페이지

**넣지 말 것**

- 새로운 비즈니스 규칙 (위젯에 규칙이 생기면 `features` 또는 `entities`로 내립니다)

---

## 3. `app.js` 함수군 → 분리 방향 (요약)

| 성격 | 예시 (현재 `app.js`) | 제안 위치 |
|------|----------------------|-----------|
| 순수 문자열·날짜·CSV | `normalizeKey`, `normalizeDateInput`, `parseDelimited`, `guessDelimiter` | `shared/lib` |
| 상수·라벨 맵 | `TYPE_LABELS`, `STATUS_VALUE_ALIASES`, `HEADER_ALIASES` | `shared/constants` |
| 엔티티 규칙 | `normalizeDomains`, `getStatusOptionsForItem`, `getNextCode`, `prepareImport`의 레코드 정규화 | `entities/*/model` |
| 스토어 읽기+쓰기 | `saveSelectedItem`, `toggleLockSelectedItem`, `executeImport`, `moveDomainNode` | `features/*` + 훅 또는 액션 모듈 |
| 렌더 전용 (거대) | `renderTreeExplorer` | `widgets/item-tree-explorer` 컴포넌트로 쪼개고, 이벤트는 feature 훅에 연결 |

---

## 4. 마이그레이션 중 추출 순서 (권장)

1. **타입 + 상수 + 순수 유틸** (`shared` + `entities/model`) — 테스트 붙이기 쉬움  
2. **스토어/영속화 한 곳** (`app/store` 또는 `shared/lib/storage`) — `loadState` / `saveState` 대체  
3. **entity UI 조각** (배지·pill·작은 카드)  
4. **feature 훅** (저장·import·DnD) — 기존 동작을 훅 단위로 옮기며 화면 하나씩 React로 전환  
5. **widgets/pages** 조합  

한 번에 파일을 쪼개기 어렵면, 같은 레이어 안에 `legacy-bridge.ts`로 임시 export를 두고 점진적으로 import 경로만 바꿔도 됩니다.

---

## 5. 흔한 실수 (FSD·유지보수)

- `features` A가 `features` B를 import — 가능하면 **공통 순수 로직**을 `entities` 또는 `shared`로 내림  
- `shared`가 `entities`를 import — **금지** (의존 역전)  
- 비즈니스 규칙이 컴포넌트 `useEffect` 안에만 있음 — **재사용·테스트**를 위해 순수 함수로 먼저 추출  
- 동일 검증이 Zod와 수동 `if`에 중복 — [05-forms-validation.md](./05-forms-validation.md)대로 **단일 소스** 유지  

---

## 6. 요약 체크리스트

| 관점 | 배치 | 키워드 |
|------|------|--------|
| 공용 UI | `shared/ui` | 도메인 무관, Shadcn 래퍼 |
| 유틸 | `shared/lib` | 순수, React 없음 |
| 도메인 규칙·표현 | `entities/*` | 타입, 정규화, 작은 UI |
| 유스케이스·쓰기 | `features/*` | 훅, 스토어/서버 |
| 배치 | `widgets` / `pages` | 조합만 |

이 기준은 마이그레이션 **진행 중**에도 코드 리뷰 질문으로 그대로 사용할 수 있습니다.
