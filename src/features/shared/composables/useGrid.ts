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
