# [Design] ag-grid

## 메타 정보

| 항목   | 내용                                  |
| ------ | ------------------------------------- |
| 기능명 | ag-grid                               |
| 작성일 | 2026-03-05                            |
| 작성자 | Claude Code                           |
| 상태   | Design                                |
| 참조   | docs/01-plan/features/ag-grid.plan.md |

---

## 1. 변경 파일 목록

| 파일 경로                                    | 변경 유형 | 설명                                       |
| -------------------------------------------- | :-------: | ------------------------------------------ |
| `package.json`                               |   수정    | ag-grid-community, ag-grid-vue3 추가       |
| `src/boot/ag-grid.ts`                        |   신규    | AG Grid 모듈 등록 + Enterprise 전환 포인트 |
| `quasar.config.ts`                           |   수정    | boot 배열에 `ag-grid` 추가                 |
| `src/css/app.scss`                           |   수정    | AG Grid CSS 전역 import                    |
| `src/types/grid.ts`                          |   신규    | 공통 그리드 타입 정의                      |
| `src/features/shared/composables/useGrid.ts` |   신규    | 그리드 API 래퍼 컴포저블                   |
| `src/features/shared/components/AppGrid.vue` |   신규    | 공통 그리드 래퍼 컴포넌트                  |
| `src/features/shared/SamplePage.vue`         |   수정    | AppGrid 데모 적용                          |
| `.env.example`                               |   신규    | Enterprise 라이선스 키 환경변수 문서       |

**총 9개 파일 (신규 5, 수정 4)**

---

## 2. 패키지 의존성

### 설치 명령

```bash
npm install ag-grid-community ag-grid-vue3
```

### package.json 변경

```json
{
  "dependencies": {
    "ag-grid-community": "^33.0.0",
    "ag-grid-vue3": "^33.0.0"
  }
}
```

> **Enterprise 전환 시**: `ag-grid-community` → `ag-grid-enterprise` 교체, `ag-grid-vue3`는 그대로 유지

---

## 3. 파일별 상세 설계

### 3-1. `src/boot/ag-grid.ts` (신규)

**역할**: AG Grid 모듈을 전역으로 등록한다. Community → Enterprise 전환의 유일한 변경 지점.

```typescript
// ────────────────────────────────────────────────────────
// Community 버전 (현재)
// ────────────────────────────────────────────────────────
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

// ────────────────────────────────────────────────────────
// Enterprise 전환 시 위 코드를 아래로 교체:
//
// import { ModuleRegistry, AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
// if (import.meta.env.VITE_AG_GRID_LICENSE_KEY) {
//   LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);
// }
// ModuleRegistry.registerModules([AllEnterpriseModule]);
// ────────────────────────────────────────────────────────

export default {};
```

> `defineBoot` 래퍼 불필요 — 모듈 등록은 Quasar 앱 초기화 전에 실행되어야 하며,
> 사이드 이펙트 import로 처리하는 것이 AG Grid 공식 권장 방식이다.

---

### 3-2. `quasar.config.ts` (수정)

**변경 내용**: `boot` 배열에 `'ag-grid'` 추가 (i18n, axios 뒤에 위치)

```typescript
boot: ['i18n', 'axios', 'ag-grid'],
```

---

### 3-3. `src/css/app.scss` (수정)

**역할**: AG Grid 스타일을 전역으로 import한다.

```scss
// AG Grid 기본 레이아웃 CSS
@import 'ag-grid-community/styles/ag-grid.css';
// Quartz 테마 (Material Design 계열, Quasar와 시각적 일치)
@import 'ag-grid-community/styles/ag-theme-quartz.css';
```

---

### 3-4. `src/types/grid.ts` (신규)

**역할**: AG Grid 관련 공통 타입을 프로젝트 전체에서 재사용 가능하도록 정의한다.
직접 `ag-grid-community` 타입을 re-export하여 미래에 교체가 용이하도록 한다.

```typescript
/**
 * AG Grid 공통 타입 정의.
 *
 * ag-grid-community 타입을 re-export하여 애플리케이션 코드가
 * ag-grid 패키지를 직접 참조하지 않도록 분리한다.
 * Enterprise 전환 시 이 파일의 import 경로만 변경하면 된다.
 */
export type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';

/**
 * AppGrid.vue Props 타입
 */
export interface AppGridProps {
  /** 컬럼 정의 배열 */
  columnDefs: ColDef[];
  /** 행 데이터 배열 */
  rowData: unknown[];
  /** 그리드 높이 (CSS 문자열, 기본값: '400px') */
  height?: string;
  /** 페이지네이션 사용 여부 (기본값: true) */
  pagination?: boolean;
  /** 페이지당 행 수 (기본값: 20) */
  pageSize?: number;
  /** 행 선택 모드 */
  rowSelection?: 'single' | 'multiple';
  /** 로딩 오버레이 표시 여부 */
  loading?: boolean;
}

/**
 * AppGrid.vue Emits 타입
 */
export interface AppGridEmits {
  /** 행 단일 클릭 */
  'row-click': [row: unknown];
  /** 행 더블 클릭 */
  'row-double-click': [row: unknown];
  /** 행 선택 변경 (다중 선택 포함) */
  'selection-changed': [rows: unknown[]];
}
```

---

### 3-5. `src/features/shared/composables/useGrid.ts` (신규)

**역할**: 그리드 API 접근 및 공통 동작(CSV 내보내기 등)을 캡슐화한다.

````typescript
import { shallowRef } from 'vue';
import type { GridApi, GridReadyEvent } from 'src/types/grid';

/**
 * AG Grid API 래퍼 컴포저블.
 *
 * AppGrid.vue의 @grid-ready 이벤트와 연결하여 gridApi에 접근한다.
 *
 * 사용 예시:
 * ```vue
 * <script setup lang="ts">
 * const { onGridReady, exportCsv } = useGrid();
 * </script>
 * <template>
 *   <AppGrid @grid-ready="onGridReady" ... />
 *   <q-btn @click="exportCsv('data')" label="CSV 내보내기" />
 * </template>
 * ```
 */
export function useGrid() {
  /** AG Grid API 인스턴스. 그리드 준비 전에는 null. */
  const gridApi = shallowRef<GridApi | null>(null);

  /**
   * 그리드 준비 완료 콜백. AppGrid의 @grid-ready 이벤트에 연결한다.
   */
  function onGridReady(params: GridReadyEvent): void {
    gridApi.value = params.api;
  }

  /**
   * 현재 그리드 데이터를 CSV로 내보낸다.
   * @param fileName - 저장할 파일명 (확장자 제외, 기본값: 'export')
   */
  function exportCsv(fileName = 'export'): void {
    gridApi.value?.exportDataAsCsv({ fileName });
  }

  /**
   * 선택된 행 데이터를 반환한다.
   */
  function getSelectedRows<T = unknown>(): T[] {
    return (gridApi.value?.getSelectedRows() ?? []) as T[];
  }

  /**
   * 모든 행의 필터를 초기화한다.
   */
  function clearFilters(): void {
    gridApi.value?.setFilterModel(null);
  }

  return {
    gridApi,
    onGridReady,
    exportCsv,
    getSelectedRows,
    clearFilters,
  };
}
````

---

### 3-6. `src/features/shared/components/AppGrid.vue` (신규)

**역할**: AG Grid를 Quasar 프로젝트 컨벤션에 맞게 감싸는 공통 래퍼 컴포넌트.

#### 템플릿 구조

```
AppGrid
└── div.app-grid-container (height 적용)
    └── AgGridVue.ag-theme-quartz (AG Grid 본체)
```

#### 전체 구현 스펙

```vue
<template>
  <div class="app-grid-container" :style="{ height }">
    <AgGridVue
      class="ag-theme-quartz"
      style="width: 100%; height: 100%"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :pagination="pagination"
      :paginationPageSize="pageSize"
      :rowSelection="rowSelectionConfig"
      :loading="loading"
      :defaultColDef="defaultColDef"
      :localeText="localeText"
      @grid-ready="emit('grid-ready', $event)"
      @row-clicked="onRowClicked"
      @row-double-clicked="onRowDoubleClicked"
      @selection-changed="onSelectionChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type {
  ColDef,
  GridReadyEvent,
  RowClickedEvent,
  SelectionChangedEvent,
} from 'src/types/grid';

// ── Props ──────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    columnDefs: ColDef[];
    rowData: unknown[];
    height?: string;
    pagination?: boolean;
    pageSize?: number;
    rowSelection?: 'single' | 'multiple';
    loading?: boolean;
  }>(),
  {
    height: '400px',
    pagination: true,
    pageSize: 20,
    rowSelection: undefined,
    loading: false,
  },
);

// ── Emits ──────────────────────────────────────────────
const emit = defineEmits<{
  'grid-ready': [event: GridReadyEvent];
  'row-click': [row: unknown];
  'row-double-click': [row: unknown];
  'selection-changed': [rows: unknown[]];
}>();

// ── 기본 컬럼 설정 ─────────────────────────────────────
const defaultColDef: ColDef = {
  sortable: true, // 모든 컬럼 정렬 허용
  filter: true, // 모든 컬럼 필터 허용
  resizable: true, // 컬럼 너비 조절 허용
  minWidth: 80,
};

// ── 행 선택 설정 ───────────────────────────────────────
const rowSelectionConfig = computed(() => {
  if (!props.rowSelection) return undefined;
  return { mode: props.rowSelection === 'single' ? 'singleRow' : 'multiRow' };
});

// ── 한국어 로케일 ──────────────────────────────────────
const localeText = {
  page: '페이지',
  more: '더보기',
  to: '~',
  of: '/',
  next: '다음',
  last: '마지막',
  first: '처음',
  previous: '이전',
  loadingOoo: '로딩 중...',
  noRowsToShow: '데이터가 없습니다.',
  filterOoo: '필터...',
  equals: '같음',
  notEqual: '같지 않음',
  lessThan: '미만',
  greaterThan: '초과',
  contains: '포함',
  startsWith: '시작',
  endsWith: '끝남',
  searchOoo: '검색...',
  selectAll: '전체 선택',
  selectAllSearchResults: '검색 결과 전체 선택',
  blanks: '(빈 값)',
  applyFilter: '적용',
  resetFilter: '초기화',
  columns: '컬럼',
  filters: '필터',
};

// ── 이벤트 핸들러 ──────────────────────────────────────
function onRowClicked(event: RowClickedEvent): void {
  emit('row-click', event.data);
}

function onRowDoubleClicked(event: RowClickedEvent): void {
  emit('row-double-click', event.data);
}

function onSelectionChanged(event: SelectionChangedEvent): void {
  const rows = event.api.getSelectedRows();
  emit('selection-changed', rows);
}
</script>
```

---

### 3-7. `src/features/shared/SamplePage.vue` (수정)

**역할**: AppGrid 동작 확인을 위한 데모 그리드를 표시한다.

```vue
<template>
  <div class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ pageTitle }}</div>

    <!-- CSV 내보내기 버튼 -->
    <q-btn
      flat
      dense
      icon="download"
      label="CSV 내보내기"
      class="q-mb-sm"
      @click="exportCsv('sample-data')"
    />

    <!-- 그리드 -->
    <AppGrid
      :columnDefs="columnDefs"
      :rowData="rowData"
      height="500px"
      row-selection="multiple"
      @grid-ready="onGridReady"
      @row-click="onRowClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { ColDef } from 'src/types/grid';
import AppGrid from './components/AppGrid.vue';
import { useGrid } from './composables/useGrid';

defineProps<{ pageTitle: string }>();

const { onGridReady, exportCsv } = useGrid();

// 샘플 컬럼 정의
const columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: '이름', flex: 1 },
  { field: 'dept', headerName: '부서', flex: 1 },
  { field: 'position', headerName: '직급', flex: 1 },
  { field: 'joinDate', headerName: '입사일', flex: 1 },
];

// 샘플 데이터 (실제 업무에서는 API 호출로 대체)
const rowData = [
  { id: 1, name: '홍길동', dept: '개발팀', position: '과장', joinDate: '2020-03-02' },
  { id: 2, name: '김철수', dept: '기획팀', position: '대리', joinDate: '2021-07-01' },
  { id: 3, name: '이영희', dept: '디자인팀', position: '사원', joinDate: '2023-01-10' },
  { id: 4, name: '박민준', dept: '개발팀', position: '차장', joinDate: '2018-05-15' },
  { id: 5, name: '최지현', dept: '인사팀', position: '과장', joinDate: '2019-11-20' },
  { id: 6, name: '정수연', dept: '개발팀', position: '대리', joinDate: '2022-02-14' },
  { id: 7, name: '강태양', dept: '영업팀', position: '사원', joinDate: '2024-01-08' },
  { id: 8, name: '윤서아', dept: '기획팀', position: '부장', joinDate: '2016-09-01' },
  { id: 9, name: '임동현', dept: '개발팀', position: '사원', joinDate: '2023-08-21' },
  { id: 10, name: '한소희', dept: '디자인팀', position: '대리', joinDate: '2021-04-05' },
];

function onRowClick(row: unknown): void {
  console.log('[AppGrid] row clicked:', row);
}
</script>
```

---

### 3-8. `.env.example` (신규)

**역할**: 환경변수 사용 문서화. `.env.example`은 Git에 커밋하고 실제 `.env`는 `.gitignore`에 포함.

```dotenv
# AG Grid Enterprise 라이선스 키
# Community 버전 사용 시 비워두거나 생략 가능
# Enterprise 라이선스 구매 후 이 값을 설정하면 Enterprise 기능이 활성화됨
VITE_AG_GRID_LICENSE_KEY=
```

---

## 4. 디렉토리 구조 (최종)

```
src/
├── boot/
│   ├── axios.ts
│   ├── i18n.ts
│   └── ag-grid.ts              ← 신규: Community/Enterprise 전환 포인트
│
├── css/
│   └── app.scss                ← 수정: AG Grid CSS import 추가
│
├── types/
│   ├── index.ts
│   └── grid.ts                 ← 신규: 공통 그리드 타입
│
└── features/
    └── shared/
        ├── SamplePage.vue      ← 수정: AppGrid 데모 적용
        ├── components/
        │   └── AppGrid.vue     ← 신규: 공통 그리드 래퍼
        └── composables/
            └── useGrid.ts      ← 신규: 그리드 API 컴포저블
```

---

## 5. Community → Enterprise 전환 절차

전환 시 **2개 파일만** 수정하면 된다:

### Step 1. 패키지 교체

```bash
npm uninstall ag-grid-community
npm install ag-grid-enterprise
```

### Step 2. `src/boot/ag-grid.ts` 교체

```typescript
// 기존 Community 코드 3줄을 아래 4줄로 교체
import { ModuleRegistry, AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
if (import.meta.env.VITE_AG_GRID_LICENSE_KEY) {
  LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);
}
ModuleRegistry.registerModules([AllEnterpriseModule]);
```

### Step 3. `.env` 라이선스 키 설정

```dotenv
VITE_AG_GRID_LICENSE_KEY=your_actual_license_key_here
```

**AppGrid.vue, useGrid.ts, SamplePage.vue, 업무 페이지 — 수정 없음.**

---

## 6. 데이터 흐름

```
업무 페이지 (예: OrderListPage.vue)
  │
  ├─ columnDefs: ColDef[]   ──────────────→  AppGrid.vue
  ├─ rowData: unknown[]     ──────────────→  AppGrid.vue
  │                                               │
  │  useGrid()                                    │ (내부)
  │  ├─ onGridReady ←── @grid-ready ─────────────┘
  │  ├─ exportCsv()         AG Grid Core (ag-grid-community)
  │  └─ getSelectedRows()   (boot/ag-grid.ts에서 모듈 등록됨)
  │
  └─ @row-click ←── AppGrid Emit
```

---

## 7. 검증 항목 (총 12개)

### 설치 및 빌드

| #   | 항목                 | 기준                                                  |
| --- | -------------------- | ----------------------------------------------------- |
| 1   | 패키지 설치          | `npm install` 오류 없음                               |
| 2   | TypeScript 타입 체크 | `vue-tsc --noEmit -p .quasar/tsconfig.json` 오류 없음 |
| 3   | ESLint               | `npm run lint` 오류 없음                              |
| 4   | 빌드                 | `npm run build` 오류 없음                             |

### 런타임 동작

| #   | 항목           | 기준                                       |
| --- | -------------- | ------------------------------------------ |
| 5   | 그리드 렌더링  | SamplePage 접속 시 그리드 표시             |
| 6   | 컬럼 헤더 정렬 | 컬럼 클릭 시 오름차순/내림차순 전환        |
| 7   | 헤더 필터      | 필터 아이콘 클릭 → 필터 UI 표시            |
| 8   | 페이지네이션   | 하단 페이지 이동 버튼 동작                 |
| 9   | CSV 내보내기   | 버튼 클릭 시 CSV 파일 다운로드             |
| 10  | 행 클릭 이벤트 | 행 클릭 시 콘솔 로그 출력                  |
| 11  | 한국어 UI      | 로케일 텍스트(페이지, 필터 등) 한국어 표시 |

### Enterprise 전환 검증

| #   | 항목        | 기준                                         |
| --- | ----------- | -------------------------------------------- |
| 12  | 전환 용이성 | boot 파일 + package.json 2곳만 수정으로 전환 |
