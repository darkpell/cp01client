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

```
src/
├── assets/          # 정적 자산 (이미지, 폰트 등)
├── boot/            # Quasar 부트 파일 (플러그인 초기화)
├── components/      # 재사용 가능한 컴포넌트
├── composables/     # 재사용 로직 (use* 접두사)
├── layouts/         # 레이아웃 컴포넌트
├── pages/           # 페이지 컴포넌트 (라우터와 1:1 매핑)
├── router/          # Vue Router 설정
├── stores/          # Pinia 스토어
├── i18n/            # 다국어 리소스 파일
└── types/           # TypeScript 타입 정의
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

- 파일명: `use{Name}Store.ts`
- Composition API 스타일 정의 (`defineStore` + setup 함수)
- 스토어당 단일 책임 원칙

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

- 마지막 업그레이드: 2026-03-04
- 다음 체크 권장: 2026-04-04 (월 1회 권장)
- 업그레이드 실행: `/upgrade-claude-code`
