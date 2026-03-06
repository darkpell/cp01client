# [Plan] ag-grid

## 메타 정보

| 항목     | 내용        |
| -------- | ----------- |
| 기능명   | ag-grid     |
| 작성일   | 2026-03-05  |
| 작성자   | Claude Code |
| 상태     | Plan        |
| 우선순위 | 높음        |

---

## 1. 배경 및 목적

### 현재 문제점

CP01CLIENT의 업무 화면들은 현재 `SamplePage.vue`(개발 예정 플레이스홀더)로 대체되어 있다.
실제 업무 데이터를 표시할 고성능 그리드 컴포넌트가 없어 데이터 목록 화면 개발이 불가능하다.

### 목표

- **단기**: AG Grid Community(무료/오픈소스)로 그리드 기능 구현
- **장기**: 코드 수정 최소화로 AG Grid Enterprise(유료) 전환 가능하도록 추상화 레이어 설계

### 비즈니스 가치

- 정렬, 필터, 페이지네이션 등 데이터 조작 기능 즉시 제공
- 대용량 데이터 가상 스크롤 지원 (수만 건 이상)
- Enterprise 전환 시 엑셀 내보내기, 행 그룹화, 피벗 등 고급 기능 활성화

---

## 2. 범위 (Scope)

### IN (이번에 구현)

- AG Grid Community 패키지 설치 및 Quasar 프로젝트 통합
- `AppGrid.vue` 래퍼 컴포넌트 — 공통 그리드 UI 컴포넌트
- `useGrid` 컴포저블 — 공통 그리드 로직 (정렬·필터·페이지네이션 상태)
- `boot/ag-grid.ts` 부트 파일 — 모듈 등록 및 라이선스 키 주입 포인트
- `features/shared/` 위치에 배치하여 모든 도메인에서 재사용
- Community → Enterprise 전환 가이드 문서화

### OUT (이번 범위 제외)

- 실제 API 연동 (별도 기능으로 분리)
- AG Grid Enterprise 기능 구현 (엑셀 내보내기, 행 그룹화 등)
- 서버 사이드 무한 스크롤 (Server-Side Row Model)

---

## 3. AG Grid 버전 비교 및 전환 전략

### Community vs Enterprise

| 기능            | Community (무료) | Enterprise (유료) |
| --------------- | :--------------: | :---------------: |
| 기본 정렬/필터  |        ✅        |        ✅         |
| 컬럼 리사이징   |        ✅        |        ✅         |
| 행 선택         |        ✅        |        ✅         |
| 페이지네이션    |        ✅        |        ✅         |
| CSV 내보내기    |        ✅        |        ✅         |
| 가상 스크롤     |        ✅        |        ✅         |
| 엑셀 내보내기   |        ❌        |        ✅         |
| 행 그룹화/피벗  |        ❌        |        ✅         |
| 고급 필터 패널  |        ❌        |        ✅         |
| 우클릭 컨텍스트 |        ❌        |        ✅         |
| 사이드바        |        ❌        |        ✅         |
| 범위 선택       |        ❌        |        ✅         |

### Enterprise 전환 시 변경 포인트 (단 2곳)

```typescript
// 1. boot/ag-grid.ts — import 경로 변경
// Before (Community)
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// After (Enterprise)
import { ModuleRegistry, AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);
ModuleRegistry.registerModules([AllEnterpriseModule]);

// 2. package.json — 패키지 교체
// Before: "ag-grid-community": "^33.x.x"
// After:  "ag-grid-enterprise": "^33.x.x"
```

**AppGrid.vue, useGrid.ts 등 모든 애플리케이션 코드는 변경 불필요.**

---

## 4. 아키텍처 설계

### 디렉토리 구조

```
src/
├── boot/
│   └── ag-grid.ts                    # AG Grid 모듈 등록 + 라이선스 주입 포인트
│
├── features/
│   └── shared/
│       ├── components/
│       │   └── AppGrid.vue           # 공통 그리드 래퍼 컴포넌트
│       └── composables/
│           └── useGrid.ts            # 공통 그리드 로직 컴포저블
│
└── types/
    └── grid.ts                       # AG Grid 관련 공통 타입 정의
```

### 의존성 방향

```
업무 페이지 (예: features/business/OrderListPage.vue)
  └─ uses ─→ AppGrid.vue (features/shared/components/)
               └─ uses ─→ useGrid.ts (features/shared/composables/)
                            └─ uses ─→ ag-grid-community (boot에서 초기화)
```

### AppGrid.vue 핵심 Props 설계

```typescript
interface AppGridProps {
  // 필수
  columnDefs: ColDef[]; // 컬럼 정의
  rowData: unknown[]; // 행 데이터

  // 선택 (기본값 있음)
  height?: string; // 그리드 높이 (기본: '400px')
  pagination?: boolean; // 페이지네이션 여부 (기본: true)
  pageSize?: number; // 페이지당 행 수 (기본: 20)
  rowSelection?: 'single' | 'multiple'; // 행 선택 모드
  loading?: boolean; // 로딩 상태 오버레이
}

// Emits
interface AppGridEmits {
  'row-click': [row: unknown]; // 행 클릭
  'row-double-click': [row: unknown]; // 행 더블클릭
  'selection-changed': [rows: unknown[]]; // 선택 변경
}
```

### useGrid 컴포저블 설계

```typescript
// 사용 예시
const { gridApi, onGridReady, exportCsv } = useGrid();
```

---

## 5. 구현 순서

| 순서 | 작업                       | 파일                                         |
| :--: | -------------------------- | -------------------------------------------- |
|  1   | 패키지 설치                | `npm install ag-grid-community`              |
|  2   | 부트 파일 생성             | `src/boot/ag-grid.ts`                        |
|  3   | quasar.config.ts boot 등록 | `quasar.config.ts`                           |
|  4   | 공통 타입 정의             | `src/types/grid.ts`                          |
|  5   | useGrid 컴포저블 구현      | `src/features/shared/composables/useGrid.ts` |
|  6   | AppGrid 래퍼 컴포넌트 구현 | `src/features/shared/components/AppGrid.vue` |
|  7   | SamplePage에 데모 적용     | `src/features/shared/SamplePage.vue`         |
|  8   | CLAUDE.md 업데이트         | `CLAUDE.md`                                  |

---

## 6. 기술 결정 사항

### AG Grid v33 모듈 방식 채택

AG Grid v33부터 `AllCommunityModule`을 사용하는 새 모듈 시스템을 권장.
`AgGridModule`(레거시 방식) 대신 `ModuleRegistry.registerModules()` 사용.

### CSS 테마 전략

Quasar의 Material Design 테마와 조화를 위해 **ag-theme-quartz** 사용.
커스텀 CSS 변수로 Quasar `$primary` 색상과 통일.

### 환경 변수 준비

Enterprise 전환 시 즉시 사용할 수 있도록 `.env` 구조 사전 설계:

```
VITE_AG_GRID_LICENSE_KEY=   # Enterprise 라이선스 키 (비워두면 Community 동작)
```

---

## 7. 검증 기준

| 항목                   | 기준                                |
| ---------------------- | ----------------------------------- |
| 설치 및 빌드           | `npm run build` 오류 없음           |
| 타입 체크              | `vue-tsc --noEmit` 오류 없음        |
| ESLint                 | 오류 없음                           |
| 데모 화면              | SamplePage에서 그리드 렌더링 확인   |
| 정렬/필터              | 컬럼 클릭 정렬, 헤더 필터 동작 확인 |
| 페이지네이션           | 페이지 이동 동작 확인               |
| Enterprise 전환 난이도 | boot 파일 + package.json 2곳만 수정 |

---

## 8. 참고 사항

- AG Grid 공식 문서: https://www.ag-grid.com/vue-data-grid/getting-started/
- Community 라이선스: MIT (상업적 사용 무제한)
- Enterprise 라이선스: 유료 (개발자 수 기반 과금)
- Vue 3 지원: `ag-grid-vue3` 패키지 사용
