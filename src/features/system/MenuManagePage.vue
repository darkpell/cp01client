<template>
  <div class="q-pa-md">
    <!-- 헤더 -->
    <div class="row items-center q-mb-md">
      <span class="text-h6">메뉴 관리</span>
      <q-space />
      <q-btn color="primary" icon="add" label="등록" @click="openCreate" />
    </div>

    <!-- 목록 그리드 (읽기 전용) -->
    <AppGrid
      :columnDefs="columnDefs"
      :rowData="menuStore.menus"
      :loading="menuStore.loading"
      height="calc(100vh - 180px)"
      @grid-ready="onGridReady"
    />

    <!-- 등록/수정 다이얼로그 -->
    <q-dialog v-model="dialog.open" persistent>
      <q-card style="min-width: 480px">
        <q-card-section>
          <div class="text-h6">{{ dialog.isEdit ? '메뉴 수정' : '메뉴 등록' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.menuCode"
            label="메뉴 코드"
            :disable="dialog.isEdit"
            :hint="dialog.isEdit ? '메뉴 코드는 수정할 수 없습니다' : '대문자·숫자·_ 만 허용'"
          />
          <q-input v-model="form.menuName" label="메뉴명" />
          <q-input v-model="form.menuUrl" label="URL" />
          <q-input v-model.number="form.menuOrder" label="정렬 순서" type="number" />
          <q-select
            v-model="form.parentId"
            :options="parentOptions"
            label="상위 메뉴"
            clearable
            emit-value
            map-options
          />
          <q-input v-model="form.icon" label="아이콘" />
          <q-select
            v-model="form.allowedRoles"
            :options="roleOptions"
            label="허용 역할"
            multiple
            emit-value
            map-options
          />
          <q-toggle v-model="form.isActive" label="활성화" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" @click="closeDialog" />
          <q-btn color="primary" label="저장" :loading="saving" @click="handleSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <q-dialog v-model="confirmDelete.open">
      <q-card>
        <q-card-section class="text-h6">삭제 확인</q-card-section>
        <q-card-section>"{{ confirmDelete.menuName }}" 메뉴를 삭제할까요?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" @click="confirmDelete.open = false" />
          <q-btn color="negative" label="삭제" :loading="saving" @click="handleDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue';
import type { ColDef } from 'src/types/grid';
import type { MenuDto } from 'src/types';
import AppGrid from '../shared/components/AppGrid.vue';
import { useGrid } from '../shared/composables/useGrid';
import { useMenuStore } from './menu-store';

const menuStore = useMenuStore();
const { onGridReady } = useGrid();
const saving = ref(false);

// ── 역할 옵션 ────────────────────────────────────────
const roleOptions = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'USER', value: 'USER' },
];

// ── 상위 메뉴 옵션 (현재 메뉴 목록에서 동적 생성) ───
const parentOptions = computed(() => [
  { label: '(없음)', value: null },
  ...menuStore.menus.map((m) => ({ label: m.menuName, value: m.id })),
]);

// ── 다이얼로그 상태 ──────────────────────────────────
const dialog = reactive({
  open: false,
  isEdit: false,
  editId: null as number | null,
});

const form = reactive({
  menuCode: '',
  menuName: '',
  menuUrl: '',
  menuOrder: 0,
  parentId: null as number | null,
  icon: '',
  allowedRoles: [] as string[],
  isActive: true,
});

const confirmDelete = reactive({
  open: false,
  id: null as number | null,
  menuName: '',
});

// ── 컬럼 정의 ────────────────────────────────────────
const columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'menuCode', headerName: '메뉴 코드', width: 150 },
  { field: 'menuName', headerName: '메뉴명', flex: 1 },
  { field: 'menuUrl', headerName: 'URL', flex: 1 },
  { field: 'menuOrder', headerName: '순서', width: 80 },
  {
    field: 'isActive',
    headerName: '활성화',
    width: 80,
    cellRenderer: (params: { value: boolean }) => (params.value ? '활성' : '비활성'),
  },
  {
    field: 'allowedRoles',
    headerName: '허용 역할',
    width: 150,
    cellRenderer: (params: { value: string[] }) => params.value?.join(', ') ?? '',
  },
  {
    headerName: '관리',
    width: 130,
    sortable: false,
    filter: false,
    cellRenderer: (params: { data: MenuDto }) =>
      `<button data-id="${params.data.id}" data-action="edit" class="q-btn q-btn--flat q-btn--dense text-primary q-mr-xs">수정</button>` +
      `<button data-id="${params.data.id}" data-name="${params.data.menuName}" data-action="delete" class="q-btn q-btn--flat q-btn--dense text-negative">삭제</button>`,
  },
];

// ── 다이얼로그 열기/닫기 ─────────────────────────────
function openCreate(): void {
  dialog.isEdit = false;
  dialog.editId = null;
  Object.assign(form, {
    menuCode: '',
    menuName: '',
    menuUrl: '',
    menuOrder: 0,
    parentId: null,
    icon: '',
    allowedRoles: [],
    isActive: true,
  });
  dialog.open = true;
}

function openEdit(menu: MenuDto): void {
  dialog.isEdit = true;
  dialog.editId = menu.id;
  Object.assign(form, {
    menuCode: menu.menuCode,
    menuName: menu.menuName,
    menuUrl: menu.menuUrl ?? '',
    menuOrder: menu.menuOrder,
    parentId: menu.parentId,
    icon: menu.icon ?? '',
    allowedRoles: [...menu.allowedRoles],
    isActive: menu.isActive,
  });
  dialog.open = true;
}

function openConfirmDelete(menu: MenuDto): void {
  confirmDelete.id = menu.id;
  confirmDelete.menuName = menu.menuName;
  confirmDelete.open = true;
}

function closeDialog(): void {
  dialog.open = false;
}

// ── CRUD 핸들러 ──────────────────────────────────────
async function handleSave(): Promise<void> {
  saving.value = true;
  try {
    if (dialog.isEdit && dialog.editId !== null) {
      await menuStore.update(dialog.editId, {
        menuName: form.menuName,
        ...(form.menuUrl ? { menuUrl: form.menuUrl } : {}),
        menuOrder: form.menuOrder,
        parentId: form.parentId,
        ...(form.icon ? { icon: form.icon } : {}),
        allowedRoles: form.allowedRoles,
        isActive: form.isActive,
      });
    } else {
      await menuStore.create({
        menuCode: form.menuCode,
        menuName: form.menuName,
        ...(form.menuUrl ? { menuUrl: form.menuUrl } : {}),
        menuOrder: form.menuOrder,
        parentId: form.parentId,
        ...(form.icon ? { icon: form.icon } : {}),
        allowedRoles: form.allowedRoles,
        isActive: form.isActive,
      });
    }
    dialog.open = false;
  } finally {
    saving.value = false;
  }
}

async function handleDelete(): Promise<void> {
  if (confirmDelete.id === null) return;
  saving.value = true;
  try {
    await menuStore.remove(confirmDelete.id);
    confirmDelete.open = false;
  } finally {
    saving.value = false;
  }
}

// ── 그리드 cellRenderer 버튼 이벤트 처리 ────────────
function handleGridClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const action = target.dataset['action'];
  const id = Number(target.dataset['id']);
  if (!action || !id) return;

  const menu = menuStore.menus.find((m) => m.id === id);
  if (!menu) return;

  if (action === 'edit') openEdit(menu);
  if (action === 'delete') openConfirmDelete(menu);
}

onMounted(async () => {
  await menuStore.fetchAll();
  document.addEventListener('click', handleGridClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGridClick);
});
</script>
