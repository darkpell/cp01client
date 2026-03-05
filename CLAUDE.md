# CP01CLIENT - Claude Code 가이드

## 프로젝트 개요

Vue 3 + Quasar Framework + TypeScript 기반의 프론트엔드 클라이언트 애플리케이션.

## 기술 스택

- **프레임워크**: Vue 3 (Composition API + `<script setup>`)
- **UI 라이브러리**: Quasar Framework 2.x
- **언어**: TypeScript 5.x
- **상태 관리**: Pinia 3.x
- **라우터**: Vue Router 5.x
- **번들러**: Vite (via @quasar/app-vite 2.x)
- **국제화**: vue-i18n 11.x
- **HTTP 클라이언트**: Axios

## 디렉토리 구조

Feature Module 구조 (도메인별 응집): 관련 파일(페이지·스토어·설정)을 한 폴더에 모아 유지보수성을 높인다.

```
src/
├── features/                  # 도메인별 기능 모듈 (핵심 구조)
│   ├── auth/                  # 인증 도메인
│   │   ├── LoginPage.vue      # 로그인 페이지
│   │   └── auth-store.ts      # JWT/사용자 상태 (Pinia Setup Store)
│   ├── workspace/             # 메인 작업 영역 도메인
│   │   ├── MainLayout.vue     # 레이아웃 (헤더·서브메뉴·탭)
│   │   ├── IndexPage.vue      # 홈(대시보드) 페이지
│   │   ├── tab-store.ts       # 탭 상태 관리
│   │   └── menu.config.ts     # 상단 메뉴 구조 정의 (UI와 데이터 분리)
│   └── shared/                # 도메인 간 공유 컴포넌트·페이지
│       └── SamplePage.vue     # 개발 예정 페이지 플레이스홀더
│
├── pages/                     # 독립 라우트 페이지 (레이아웃 없음)
│   └── ErrorNotFound.vue      # 404 페이지
│
├── components/                # 전역 재사용 UI 컴포넌트 (도메인 무관)
│
├── composables/               # 전역 재사용 로직 (use* 접두사)
│
├── types/                     # 전역 TypeScript 타입 정의
│   └── index.ts               # RouteMeta, PaginationMeta 등
│
├── router/                    # Vue Router (Quasar 규약 — 루트 유지)
│   ├── index.ts               # 라우터 인스턴스 + 네비게이션 가드
│   └── routes.ts              # 라우트 정의 (features/* alias 사용)
│
├── stores/                    # 전역 Pinia 설정 (Quasar 규약 — 루트 유지)
│   └── index.ts               # Pinia 팩토리 (플러그인 등록 위치)
│
├── boot/                      # Quasar 부트 파일 (Quasar 규약 — 루트 유지)
│   ├── axios.ts               # Axios 인스턴스 + JWT 인터셉터
│   └── i18n.ts                # vue-i18n 초기화 (기본 언어: ko-KR)
│
├── i18n/                      # 다국어 리소스
│   ├── index.ts               # 로케일 진입점
│   ├── ko-KR/index.ts         # 한국어 (기본 언어)
│   └── en-US/index.ts         # 영어
│
├── css/                       # 전역 스타일
│   ├── app.scss               # 커스텀 전역 CSS
│   └── quasar.variables.scss  # Quasar 테마 색상 변수
│
└── assets/                    # 정적 자산 (이미지, 폰트 등)
```

### 파일 배치 원칙

| 파일 유형                 | 배치 위치            | 이유                         |
| ------------------------- | -------------------- | ---------------------------- |
| 도메인 페이지/스토어      | `features/{domain}/` | 관련 파일 응집               |
| 도메인 간 공유 컴포넌트   | `features/shared/`   | 명확한 공유 의도             |
| 전역 UI 컴포넌트          | `components/`        | 도메인 무관 범용             |
| 재사용 로직               | `composables/`       | 컴포넌트와 로직 분리         |
| 전역 타입                 | `types/`             | 도메인별 타입은 각 feature에 |
| 레이아웃 없는 독립 페이지 | `pages/`             | 404 등                       |

### Path Alias

```typescript
// router/routes.ts에서 features 모듈 import
import('features/auth/LoginPage.vue'); // ✅ features/* alias
import('features/workspace/MainLayout.vue'); // ✅ features/* alias

// features 내부 상대 경로 사용
import { useAuthStore } from './auth-store'; // 같은 feature
import { useAuthStore } from '../auth/auth-store'; // 다른 feature
import SamplePage from '../shared/SamplePage.vue'; // shared

// Quasar 기본 alias (boot, src 등)는 그대로 사용
import { api } from 'boot/axios';
```

## 코딩 컨벤션

### Vue 컴포넌트 규칙

- **항상** `<script setup lang="ts">` 구문 사용 (Options API 금지)
- Props: `defineProps<{ name: string }>()` 제네릭 구문 사용
- Emits: `defineEmits<{ click: [id: number] }>()` 제네릭 구문 사용
- 컴포넌트 파일명: PascalCase (예: `UserProfile.vue`)
- 재사용 로직: `src/composables/use{Name}.ts`로 추출

### TypeScript 규칙

- `any` 타입 사용 금지 — `unknown` 또는 구체적 타입 사용
- 모든 함수에 반환 타입 명시
- 타입 별칭(`type`) 우선, 인터페이스는 확장 필요 시만

### Quasar 컴포넌트 규칙

- Quasar 내장 컴포넌트 (Q\*) 우선 사용 (직접 HTML 최소화)
- Quasar 유틸리티 클래스 활용 (`text-h6`, `q-pa-md`, `q-mb-lg` 등)
- CSS 미디어 쿼리 대신 Quasar 반응형 클래스 사용 (`gt-sm`, `lt-md` 등)

### Pinia 스토어 규칙

- 파일명: `{name}-store.ts` (도메인 스토어, features/ 내부) 또는 `use{Name}Store.ts` (전역)
- Composition API 스타일 정의 (`defineStore` + setup 함수) — Options API 금지
- 스토어당 단일 책임 원칙
- 도메인 스토어는 해당 feature 폴더에 위치 (`features/auth/auth-store.ts`)
- 전역 스토어(앱 수준 상태)만 `stores/`에 위치

### 파일 네이밍

| 종류     | 형식              | 예시              |
| -------- | ----------------- | ----------------- |
| 컴포넌트 | PascalCase.vue    | `UserCard.vue`    |
| 페이지   | PascalCase + Page | `LoginPage.vue`   |
| 컴포저블 | use{Name}.ts      | `useAuth.ts`      |
| 스토어   | use{Name}Store.ts | `useAuthStore.ts` |
| 유틸리티 | camelCase.ts      | `dateUtils.ts`    |

## 자주 사용하는 명령어

```bash
npm run dev        # 개발 서버 시작 (http://localhost:9000)
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷팅 (전체 파일)
```

## 중요 참고사항

- 백엔드 API는 Axios를 통해 연결 (baseURL은 환경 변수로 관리)
- JWT 인증 사용 (Access Token 로컬 스토리지 저장)
- 다국어 지원: 텍스트는 항상 i18n 키 사용 (`t('key')`)
- 코드 변경 후 lint 및 format 실행 권장
- Plan Mode를 활용해 3개 이상 파일 수정 전 전략 수립

## Claude Code 활용 팁

- `/review` 명령어로 코드 리뷰
- `/commit` 명령어로 스마트 커밋 메시지 생성
- Context7 MCP로 최신 Vue/Quasar 공식 문서 참조 가능

## 설정 업데이트 이력

- 마지막 업그레이드: 2026-03-05
- 다음 체크 권장: 2026-04-05 (월 1회 권장)
- 업그레이드 실행: `/upgrade-claude-code`
