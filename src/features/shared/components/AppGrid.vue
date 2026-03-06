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
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 80,
};

// ── 행 선택 설정 ───────────────────────────────────────
const rowSelectionConfig = computed(() => {
  if (!props.rowSelection) return undefined;
  const mode = props.rowSelection === 'single' ? ('singleRow' as const) : ('multiRow' as const);
  return { mode };
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
