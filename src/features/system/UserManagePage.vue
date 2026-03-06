<template>
  <div class="q-pa-md">
    <!-- 헤더 -->
    <div class="row items-center q-mb-md">
      <span class="text-h6">사용자 관리</span>
      <q-space />
      <q-btn color="primary" icon="add" label="등록" @click="openCreate" />
    </div>

    <!-- 목록 그리드 (읽기 전용) -->
    <AppGrid
      :columnDefs="columnDefs"
      :rowData="userStore.users"
      :loading="userStore.loading"
      height="calc(100vh - 180px)"
      @grid-ready="onGridReady"
    />

    <!-- 등록/수정 다이얼로그 -->
    <q-dialog v-model="dialog.open" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ dialog.isEdit ? '사용자 수정' : '사용자 등록' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.userId"
            label="사용자 ID"
            :disable="dialog.isEdit"
            :hint="dialog.isEdit ? '사용자 ID는 수정할 수 없습니다' : '최대 10자'"
            maxlength="10"
          />
          <q-input v-model="form.userName" label="사용자명" />
          <q-input v-model="form.email" label="이메일" type="email" />
          <q-input
            v-if="!dialog.isEdit"
            v-model="form.password"
            label="비밀번호"
            type="password"
            hint="최소 8자"
          />
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
        <q-card-section>"{{ confirmDelete.userName }}" 사용자를 삭제할까요?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" @click="confirmDelete.open = false" />
          <q-btn color="negative" label="삭제" :loading="saving" @click="handleDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import type { ColDef } from 'src/types/grid';
import type { UserDto } from 'src/types';
import AppGrid from '../shared/components/AppGrid.vue';
import { useGrid } from '../shared/composables/useGrid';
import { useUserStore } from './user-store';

const userStore = useUserStore();
const { onGridReady } = useGrid();
const saving = ref(false);

// ── 다이얼로그 상태 ──────────────────────────────────
const dialog = reactive({
  open: false,
  isEdit: false,
  editId: null as number | null,
});

const form = reactive({
  userId: '',
  userName: '',
  email: '',
  password: '',
});

const confirmDelete = reactive({
  open: false,
  id: null as number | null,
  userName: '',
});

// ── 컬럼 정의 ────────────────────────────────────────
const columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'userId', headerName: '사용자 ID', width: 120 },
  { field: 'userName', headerName: '사용자명', flex: 1 },
  { field: 'email', headerName: '이메일', flex: 1 },
  { field: 'role', headerName: '역할', width: 100 },
  {
    headerName: '관리',
    width: 130,
    sortable: false,
    filter: false,
    cellRenderer: (params: { data: UserDto }) =>
      `<button data-id="${params.data.id}" data-action="edit" class="q-btn q-btn--flat q-btn--dense text-primary q-mr-xs">수정</button>` +
      `<button data-id="${params.data.id}" data-name="${params.data.userName}" data-action="delete" class="q-btn q-btn--flat q-btn--dense text-negative">삭제</button>`,
  },
];

// ── 다이얼로그 열기/닫기 ─────────────────────────────
function openCreate(): void {
  dialog.isEdit = false;
  dialog.editId = null;
  form.userId = '';
  form.userName = '';
  form.email = '';
  form.password = '';
  dialog.open = true;
}

function openEdit(user: UserDto): void {
  dialog.isEdit = true;
  dialog.editId = user.id;
  form.userId = user.userId;
  form.userName = user.userName;
  form.email = user.email;
  form.password = '';
  dialog.open = true;
}

function openConfirmDelete(user: UserDto): void {
  confirmDelete.id = user.id;
  confirmDelete.userName = user.userName;
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
      await userStore.update(dialog.editId, {
        userName: form.userName,
        email: form.email,
      });
    } else {
      await userStore.create({
        userId: form.userId,
        userName: form.userName,
        email: form.email,
        password: form.password,
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
    await userStore.remove(confirmDelete.id);
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

  const user = userStore.users.find((u) => u.id === id);
  if (!user) return;

  if (action === 'edit') openEdit(user);
  if (action === 'delete') openConfirmDelete(user);
}

onMounted(async () => {
  await userStore.fetchAll();
  document.addEventListener('click', handleGridClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGridClick);
});
</script>
