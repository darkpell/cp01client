<template>
  <div class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ pageTitle }}</div>

    <q-btn
      flat
      dense
      icon="download"
      label="CSV 내보내기"
      class="q-mb-sm"
      @click="exportCsv('sample-data')"
    />

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

const columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: '이름', flex: 1 },
  { field: 'dept', headerName: '부서', flex: 1 },
  { field: 'position', headerName: '직급', flex: 1 },
  { field: 'joinDate', headerName: '입사일', flex: 1 },
];

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
