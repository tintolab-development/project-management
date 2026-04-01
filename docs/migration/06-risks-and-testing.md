# 06. 리스크·테스트·배포

마이그레이션 시 깨지기 쉬운 부분과 회귀 테스트 체크리스트, 배포 관련 메모입니다.

## 주요 리스크

| 영역 | 리스크 | 완화 |
|------|--------|------|
| 영속화 | `localStorage` 키·스키마 변경으로 기존 사용자 데이터 깨짐 | `schemaVersion` + 마이그레이션 함수 또는 키 분리 후 일회성 이전 |
| Import | 구분자·따옴표·빈 행·한글 헤더 엣지 케이스 | 기존 `parseDelimited` / `prepareImport`와 **동일 픽스처**로 단위 테스트 |
| DnD | 브라우저·터치·접근성 차이 | HTML5 DnD 유지 시 Safari 이슈 확인; 라이브러리 도입 시 동작 재검증 |
| 상태 전이 | 확정 ↔ 방향합의, 필드 disabled | 단위 테스트로 `allowedTransition` 고정 |
| 성능 | 아이템 수 증가 시 전체 리렌더 | 목록 가상화는 후속; 우선은 기존 규모에서 프로파일 |
| 보안 | 과거 `innerHTML` + `escapeHtml` | React 기본 이스케이프 유지, `dangerouslySetInnerHTML` 사용 금지 |

## 회귀 테스트 체크리스트 (수동)

[01-current-features.md](./01-current-features.md)의 ID를 따라가며 검증합니다. 핵심만 요약하면 다음과 같습니다.

### 내비·저장

- [ ] 4개 뷰 전환 후 새로고침 시 마지막 뷰 복원
- [ ] Items에서 필터·검색·선택 동기화
- [ ] 상세 저장 시 히스토리 `item.updated` 한 줄 추가
- [ ] 확정 항목은 필드 수정·저장 불가
- [ ] 방향합의 → 확정, 확정 해제 → 방향합의

### 대시보드·워크스페이스

- [ ] 통계 숫자가 목록 집계와 일치
- [ ] P0 카드 클릭 시 Items로 이동 및 해당 아이템 선택
- [ ] 칸반 컬럼별 카드 수·유형 필터 일치

### 트리

- [ ] 도메인 접기/펼치기 상태 유지
- [ ] 검색 시 매칭 없는 브랜치 숨김
- [ ] 도메인 DnD: 순서·부모 변경, 잘못된 중첩 시 거부
- [ ] 아이템 DnD: 도메인 변경 및 히스토리
- [ ] 도메인 삭제 시 하위 승격·아이템 이동·최소 1 도메인

### Import

- [ ] 템플릿 CSV 다운로드 후 재업로드 미리보기
- [ ] 동일 code 배치 내 중복 → 오류
- [ ] 확정 항목 행 → skip
- [ ] code 없는 신규 → 자동 code 발급
- [ ] 미리보기 50행 초과 시 안내 문구

### 글로벌

- [ ] JSON보내기 파일이 파싱 가능한 완전한 state인지
- [ ] 샘플 초기화 후 시드와 동일한 구조인지

## 자동 테스트 권장 (추가 시)

- `normalizeState`, `normalizeDomains`, `prepareImport`, `normalizeDateInput`, `getStatusOptionsForItem` — **순수 함수**로 분리 후 Vitest.
- Zod 스키마: 대표적인 유효/무효 객체 스냅샷.

## 배포 (`vercel.json`)

현재 전 경로에 대해 다음 헤더가 설정되어 있습니다.

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Vite 빌드 후에도 동일 정책을 유지하려면 **프로젝트 루트의 `vercel.json`을 그대로 두거나** SPA 라우팅용 `rewrites`만 추가하면 됩니다. 예:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

(실제 추가 여부는 라우팅 방식에 따름.)

## 완료 정의 (제안)

- 위 수동 체크리스트 통과
- `localStorage` 호환 정책 문서화 및 1회 검증
- Lighthouse 접근성·키보드 주요 플로우(모달 열기/닫기, 첫 필드 포커스) 확인
