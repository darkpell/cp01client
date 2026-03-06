/**
 * AG Grid 공통 타입 정의.
 *
 * ag-grid-community 타입을 re-export하여 애플리케이션 코드가
 * ag-grid 패키지를 직접 참조하지 않도록 분리한다.
 * Enterprise 전환 시 이 파일의 import 경로만 변경하면 된다.
 */
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';

export type { ColDef, GridApi, GridReadyEvent, RowClickedEvent, SelectionChangedEvent };

/**
 * AppGrid.vue Emits 타입
 */
export interface AppGridEmits {
  /** 그리드 초기화 완료 */
  'grid-ready': [event: GridReadyEvent];
  /** 행 단일 클릭 */
  'row-click': [row: unknown];
  /** 행 더블 클릭 */
  'row-double-click': [row: unknown];
  /** 행 선택 변경 (다중 선택 포함) */
  'selection-changed': [rows: unknown[]];
}

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
