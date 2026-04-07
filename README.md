# Tintolab Decision Workspace

내부 의사결정·프로젝트 관리용 웹 애플리케이션을 담는 **pnpm + Turborepo** 모노레포입니다.

## 사전 요구 사항

- [Node.js](https://nodejs.org/) (LTS 권장)
- [pnpm](https://pnpm.io/) **9.x** (루트 `packageManager` 필드와 맞춤)

## 빠른 시작

```bash
pnpm install
pnpm dev
```

개발 서버는 `@tdw/web`의 Vite 설정에 따라 기본적으로 **http://localhost:5173** 에서 열립니다.

## 스크립트

| 명령            | 설명                                       |
| --------------- | ------------------------------------------ |
| `pnpm dev`      | Turborepo로 워크스페이스 `dev` 태스크 실행 |
| `pnpm build`    | 프로덕션 빌드                              |
| `pnpm lint`     | Turborepo로 린트                           |
| `pnpm lint:web` | `apps/web`만 ESLint                        |

웹 앱만 다룰 때:

```bash
pnpm --filter @tdw/web dev
pnpm --filter @tdw/web build
pnpm --filter @tdw/web lint
```

## 레이아웃

```
apps/
  web/          # Vite + React 프론트엔드 (@tdw/web)
```

## `apps/web` 기술 스택

- **빌드**: Vite 8, TypeScript(엄격 모드)
- **UI**: React 19, React Router 7
- **스타일**: Tailwind CSS 3, PostCSS, 기존 글로벌 CSS(`src/app/styles/`), **CSS Modules**는 Vite 기본 지원(필요 시 `*.module.css` 사용)
- **컴포넌트**: [shadcn/ui](https://ui.shadcn.com/) 초기화 완료(`components.json`, `src/components/ui/`)
- **서버 상태**: TanStack Query (`QueryClientProvider`는 `src/app/providers/AppProviders.tsx`)
- **폼·검증**: React Hook Form, Zod, `@hookform/resolvers`
- **클라이언트 상태**: Zustand
- **구조**: Feature-Sliced Design(`app`, `pages`, `widgets`, `features`, `entities`, `shared`)

경로 별칭: `@/*` → `apps/web/src/*`

## Cursor / AI 가이드

`apps/web/.cursor/`에 이 프론트엔드용 **규칙(rules)**, **스킬(skills)**, **에이전트(agents)** 가 있습니다. 저장소를 클론한 뒤 Cursor에서 웹 앱 작업 시 동일한 가이드가 적용됩니다.

## 참고

- 루트 `package.json`의 `"private": true`는 npm에 패키지로 배포하지 않음을 의미합니다.
