# Tintolab Decision Workspace — React / FSD 마이그레이션 문서

프로젝트 의사결정 아이템 관리 프로토타입을 **Turborepo 모노레포 + React + Vite + React Hook Form + Zod + CSS 디자인 토큰 + CSS Modules + Radix UI + Feature-Sliced Design(FSD)** 로 이전하기 위한 선행 문서 모음입니다. **Tailwind·shadcn/ui(공식 Tailwind 스택)는 채택하지 않는다** — 실행 순서는 [execution-plan.md](./execution-plan.md)를 따른다.

## 목표 스택

| 영역        | 목표                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| 저장소      | Turborepo, `apps/web` 단일 패키지 (Vanilla는 이전에 `apps/legacy`로 두었다가 Phase 7에서 제거) |
| 런타임·빌드 | React 18+, Vite (`apps/web`)                                                                   |
| UI·접근성   | Radix UI Primitives + CSS Modules (토큰 `var(--*)`)                                            |
| 폼          | React Hook Form                                                                                |
| 스키마·검증 | Zod (`@hookform/resolvers/zod`)                                                                |
| 스타일      | CSS 커스텀 프로퍼티(토큰) + CSS Modules (슬라이스/컴포넌트 단위)                               |
| 구조        | FSD (`app`, `pages`, `widgets`, `features`, `entities`, `shared`)                              |

## 현재 스택 (마이그레이션 출발점)

| 영역   | 현재                                              |
| ------ | ------------------------------------------------- |
| UI     | 정적 HTML (`index.html`), `innerHTML` 기반 렌더링 |
| 로직   | 단일 파일 `app.js` (~2630줄)                      |
| 스타일 | 전역 `styles.css`                                 |
| 빌드   | 없음 (`package.json`은 메타만)                    |
| 배포   | `vercel.json` 보안 헤더                           |
| 영속화 | `localStorage` 키 `tdw-prototype-v6`              |

**참고:** UI 푸터에는 "Prototype v7"이 표시되나 저장소 키는 v6입니다. 마이그레이션 시 키 이름과 제품 버전을 일치시키는 것을 권장합니다.

## 용어

- **Item(아이템):** 의사결정·정보요청 등 추적 단위. 코드(`code`)로 식별.
- **Domain(도메인):** 트리 구조의 분류 노드. `parentId`·`order`로 계층·형제 순서 표현.
- **Workspace:** 유형(`information_request` / `decision`)별 칸반 뷰.
- **확정:** 상태값 `확정` 및/또는 `isLocked`에 따른 수정 불가 정책.

## 문서 인덱스

| 문서                                                     | 설명                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| [execution-plan.md](./execution-plan.md)                 | **실행 플랜** — 환경·Turbo·FSD·포팅 단계 (Cursor 플랜과 동기) |
| [01-current-features.md](./01-current-features.md)       | 현재 구현 기능 전체 인벤토리·체크리스트                       |
| [02-data-model.md](./02-data-model.md)                   | 상태 JSON 스키마, 정규화, Zod 매핑                            |
| [03-fsd-mapping.md](./03-fsd-mapping.md)                 | FSD 레이어·슬라이스 배치 제안                                 |
| [04-ui-and-styles.md](./04-ui-and-styles.md)             | 토큰·CSS Modules·`styles.css` 구역 분해, Radix 우선순위       |
| [05-forms-validation.md](./05-forms-validation.md)       | RHF + Zod 필드·규칙                                           |
| [06-risks-and-testing.md](./06-risks-and-testing.md)     | 리스크, 엣지 케이스, 회귀 테스트, 배포                        |
| [07-layering-extraction.md](./07-layering-extraction.md) | 공용 UI·유틸·훅·비즈니스 로직 **관점별 분리** 기준·추출 순서  |

## 마이그레이션 로드맵 (권장 순서)

1. **문서·타입 고정:** 본 문서와 `entities`용 TypeScript 타입·Zod 스키마를 먼저 정의한다. 코드를 나눌 때는 [07-layering-extraction.md](./07-layering-extraction.md)를 참고한다.
2. **Vite + React 스캐폴딩:** 라우팅(또는 단일 앱 내 탭), FSD 폴더 뼈대, `localStorage` 어댑터.
3. **Items 화면 우선:** 목록·상세·저장·확정·코멘트·히스토리(핵심 CRUD).
4. **Dashboard / Workspaces:** 통계·테이블·칸반(읽기·네비게이션 위주).
5. **Item Tree:** 도메인/아이템 DnD, 검색, 도메인 CRUD.
6. **모달 플로우:** 신규 아이템, 엑셀 일괄등록(미리보기·실행).
7. **글로벌 액션:** JSON보내기, 샘플 초기화.
8. **접근성·폴리시:** Radix·네이티브 패턴에 맞춘 키보드·포커스·라벨 정비.

## 마이그레이션 완료 후 문서 정리

마이그레이션이 끝나고 동작·테스트가 새 코드베이스 기준으로 고정된 뒤, **저장소에서 지워도 되는 문서**와 **남겨두는 편이 좋은 문서**를 구분한 표입니다. (팀 정책에 따라 보관 기간을 정해도 됩니다.)

### 삭제해도 되는 문서 (마이그레이션 전용·일회성)

아래는 **레거시 대비 체크·작업 가이드**가 목적이라, 포팅 검증과 자동 테스트가 끝난 뒤에는 소스·테스트가 진실 공급원이 되므로 **통째로 삭제 가능**합니다.

| 파일                                                 | 이유                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [01-current-features.md](./01-current-features.md)   | Vanilla 앱 기능 인벤토리·수동 체크리스트. React 앱에 동등 기능이 구현·테스트되면 역할 종료.     |
| [04-ui-and-styles.md](./04-ui-and-styles.md)         | `styles.css` → 토큰·Modules·Radix 이전 **작업 지시서**. 스타일 이전이 끝나면 중복.              |
| [05-forms-validation.md](./05-forms-validation.md)   | RHF+Zod 설계 초안. 스키마가 코드(`*.ts`)에 반영되면 문서와 이중 관리 위험.                      |
| [06-risks-and-testing.md](./06-risks-and-testing.md) | 회귀 **수동** 체크리스트·마이그레이션 리스크. E2E/단위 테스트·이슈 트래커로 대체되면 삭제 가능. |

### 선택: 삭제 또는 축약

| 파일                                                     | 완료 후 선택지                                                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 본 파일 [README.md](./README.md)                         | `docs/` 루트의 **프로젝트 README**나 `docs/architecture.md`로 목표 스택·FSD 안내를 옮긴 뒤, `docs/migration/` 전체를 비울 수 있음.                                |
| [02-data-model.md](./02-data-model.md)                   | **삭제:** Zod·타입·`README`에 스키마가 모두 반영된 경우. **보관:** `localStorage`/API 계약 문서로 팀이 별도 문서를 두지 않을 때.                                  |
| [03-fsd-mapping.md](./03-fsd-mapping.md)                 | **삭제:** 실제 폴더 구조가 문서와 같아지고, 온보딩이 코드 탐색만으로 충분한 경우. **보관:** 신규 합류자용 아키텍처 맵으로 유지.                                   |
| [07-layering-extraction.md](./07-layering-extraction.md) | **보관 권장:** 레이어·훅·유틸 분리 기준은 마이그레이션 이후에도 코드 리뷰·온보딩에 유용. **삭제:** 팀이 `CONTRIBUTING.md` 등에 동일 규칙을 옮긴 뒤 중복이면 제거. |

### 폴더 단위

- **`docs/migration/` 전체 삭제:** 위 “삭제 가능” 네 파일 + 선택 항목을 팀이 더 이상 참조하지 않을 때. 삭제 전에 필요한 내용만 `docs/README.md` 등으로 **한 페이지 요약**해 두는 것을 권장합니다.

### 코드 파일 (문서가 아님)

레거시 진입점은 마이그레이션 검증 후 제거 대상입니다. 문서가 아니라 **소스 트리에서 삭제**합니다.

| 경로                                 | 조건                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `index.html`, `app.js`, `styles.css` | 새 Vite/React 앱이 동일 기능을 대체하고, 배포·로컬 실행이 새 엔트리만 쓸 때. |
| 브랜드 등 정적 자산                  | 새 `public/` 또는 번들 경로로 이전한 뒤 기존 참조가 없을 때.                 |

## 관련 소스 파일

- `index.html` — 마크업·뷰 컨테이너
- `app.js` — 상태, 렌더링, 이벤트, import/export
- `styles.css` — 전역 스타일
- `vercel.json` — 배포 헤더
