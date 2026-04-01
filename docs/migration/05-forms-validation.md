# 05. React Hook Form + Zod 검증 설계

현재는 `alert` + 수동 `value.trim()`으로 검증합니다. 마이그레이션 후 아래 폼별로 **RHF + zodResolver**를 적용합니다.

## 공통

- **스키마 위치:** `entities/item/model` 또는 `shared/lib/validation` 중 팀 선호에 맞게 단일 소스.
- **에러 표시:** RHF `Controller`/`formState.errors` + 프로젝트 공용 라벨·메시지 컴포넌트(CSS Modules). (shadcn `Form`은 Tailwind 전제이므로 본 스택에서는 사용하지 않음.)
- **확정·잠금:** `disabled`일 때는 `useForm`의 `reset`으로 값 고정 또는 읽기 전용 모드로 전환하고 submit을 막습니다.

---

## 1. 새 항목 만들기 모달

| 필드        | 현재 규칙    | Zod 제안                                                         |
| ----------- | ------------ | ---------------------------------------------------------------- |
| type        | 필수, select | `z.enum([...])`                                                  |
| domain      | 필수         | `z.string().min(1)`                                              |
| priority    | 필수         | `z.enum(["P0","P1","P2"])`                                       |
| owner       | 선택         | `z.string()`                                                     |
| dueDate     | 선택         | `z.string()` + optional refine으로 날짜 형식 또는 빈 문자열 허용 |
| title       | 필수         | `z.string().trim().min(1, "제목을 입력해 주세요.")`              |
| description | 선택         | `z.string()`                                                     |

제출 시: 기존과 같이 `getNextCode(type)`으로 code/id 생성 후 목록에 추가.

---

## 2. 아이템 상세(편집 가능 상태)

편집 불가(확정/잠금)일 때는 폼 대신 읽기 전용 UI를 렌더링하는 것이 단순합니다.

| 필드                                             | 현재 규칙          | Zod 제안                                                                                  |
| ------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------- |
| title                                            | 저장 시 필수       | `z.string().trim().min(1)`                                                                |
| domain                                           | 필수               | `z.string().min(1)`                                                                       |
| priority                                         | 필수               | `z.enum(["P0","P1","P2"])`                                                                |
| status                                           | UI에서 허용 옵션만 | `z.enum(["논의","방향합의","확정"])` + **superRefine**으로 현재 상태에서 불가한 전이 차단 |
| owner                                            | 선택               | `z.string()`                                                                              |
| dueDate                                          | 선택               | 날짜 문자열 refine                                                                        |
| description, clientResponse, finalConfirmedValue | 선택               | `z.string()`                                                                              |

### 상태 전이 (현재 `getStatusOptionsForItem`과 동등)

- 현재 `논의` → 허용: `논의`, `방향합의`
- 현재 `방향합의` → 허용: `논의`, `방향합의`, `확정`
- 현재 `확정` → 허용: `확정`만

Zod 예시 방향:

```ts
// 개념 예시 — 실제 구현 시 이전 상태를 ctx로 넘김
.refine((data, ctx) => allowedTransition(prevStatus, data.status), { path: ["status"] })
```

`prevStatus`는 폼 외부에서 `defaultValues`와 함께 `useMemo`로 고정하거나, `z.object`를 팩토리 함수 `createItemEditSchema(prevStatus)`로 생성합니다.

### 확정 버튼(별도 액션)

- 현재: `방향합의`에서만 확정 가능.
- 폼 submit과 분리된 **`confirmLock` 액션**으로 두고, 서버/스토어에서 `status = 확정`, `isLocked = true` 처리하면 UI 규칙이 명확합니다.

---

## 3. 코멘트 작성

| 필드   | 현재 규칙 | Zod                        |
| ------ | --------- | -------------------------- |
| author | 필수      | `z.string().trim().min(1)` |
| body   | 필수      | `z.string().trim().min(1)` |

---

## 4. 엑셀 일괄등록

두 단계 스키마를 권장합니다.

**A. 행 파싱 후(느슨한 입력)** — `ImportRowSchema`

- 각 컬럼은 `z.string().optional()` 또는 `z.union([z.string(), z.number()])` 후 문자열화.
- `title`만 `trim().min(1)`으로 행 단위 성공/실패.

**B. 정규화 후(저장 직전)** — `NormalizedImportItemSchema`

- `type`, `domain`, `priority`, `status`는 현재 `normalizeImportRecord`와 동일한 기본값·매핑.
- `dueDate`는 `normalizeDateInput`과 동일한 로직을 **공유 함수**로 두고 Zod `transform`에서 호출.

UI에서는 RHF 없이 **파일/textarea + 미리보기 테이블**만 있어도 되며, "실행" 버튼은 `actionableCount > 0`일 때 활성화하는 현재 동작을 유지합니다.

---

## 5. 도메인 이름 (prompt 대체)

향후 모달로 바꿀 경우:

| 필드 | Zod                                                         |
| ---- | ----------------------------------------------------------- |
| name | `z.string().trim().min(1)` + 동일 레벨에서 중복 이름 refine |

---

## 메시지 현지화

- 기존 `alert` 문구를 Zod `message` / `FormMessage`에 그대로 옮기면 UX가 연속됩니다.
