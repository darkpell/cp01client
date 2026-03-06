# [Design] system-admin

## 메타 정보

| 항목   | 내용                                       |
| ------ | ------------------------------------------ |
| 기능명 | system-admin                               |
| 작성일 | 2026-03-06                                 |
| 작성자 | Claude Code                                |
| 상태   | Design                                     |
| 참조   | docs/01-plan/features/system-admin.plan.md |

---

## 1. 변경 파일 목록

| 파일 경로                                | 변경 유형 | 설명                                     |
| ---------------------------------------- | :-------: | ---------------------------------------- |
| `src/types/index.ts`                     |   수정    | User/Menu DTO 타입 추가                  |
| `src/features/system/user-store.ts`      |   신규    | 사용자 Pinia Setup Store                 |
| `src/features/system/menu-store.ts`      |   신규    | 메뉴 Pinia Setup Store                   |
| `src/features/system/UserManagePage.vue` |   신규    | 사용자 관리 페이지 (그리드 + 다이얼로그) |
| `src/features/system/MenuManagePage.vue` |   신규    | 메뉴 관리 페이지 (그리드 + 다이얼로그)   |
| `src/features/workspace/menu.config.ts`  |   수정    | 시스템관리 컴포넌트명 교체               |
| `src/features/workspace/MainLayout.vue`  |   수정    | componentMap에 신규 페이지 추가          |

**총 7개 파일 (신규 3, 수정 4)**

---

## 2. 파일별 상세 설계

### 2-1. `src/types/index.ts` (수정)

기존 `RouteMeta`, `PaginationMeta` 타입 유지. 아래 타입을 추가한다.

```typescript
// ── 사용자 관리 타입 ──────────────────────────────────

/** GET /api/users 응답 DTO */
export interface UserDto {
  id: number;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

/** POST /api/users 요청 DTO */
export interface UserCreateDto {
  userId: string;
  userName: string;
  email: string;
  password: string;
}

/** PUT /api/users/{id} 요청 DTO */
export interface UserUpdateDto {
  userName: string;
  email: string;
}

// ── 메뉴 관리 타입 ──────────────────────────────────

/** GET /api/menus 응답 DTO (평면 구조) */
export interface MenuDto {
  id: number;
  menuCode: string;
  menuName: string;
  menuUrl: string | null;
  menuOrder: number;
  parentId: number | null;
  icon: string | null;
  allowedRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/menus 요청 DTO */
export interface MenuCreateDto {
  menuCode: string;
  menuName: string;
  menuUrl?: string;
  menuOrder?: number;
  parentId?: number | null;
  icon?: string;
  allowedRoles: string[];
  isActive?: boolean;
}

/** PUT /api/menus/{id} 요청 DTO */
export interface MenuUpdateDto {
  menuName: string;
  menuUrl?: string;
  menuOrder?: number;
  parentId?: number | null;
  icon?: string;
  allowedRoles: string[];
  isActive: boolean;
}
```

---

### 2-2. `src/features/system/user-store.ts` (신규)

**역할**: 사용자 목록 상태 보관 및 CRUD API 호출 캡슐화.

```typescript
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { UserDto, UserCreateDto, UserUpdateDto } from 'src/types';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserDto[]>([]);
  const loading = ref(false);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    try {
      const res = await api.get<UserDto[]>('/api/users');
      users.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: UserCreateDto): Promise<void> {
    await api.post<UserDto>('/api/users', payload);
    await fetchAll();
  }

  async function update(id: number, payload: UserUpdateDto): Promise<void> {
    await api.put<UserDto>(`/api/users/${id}`, payload);
    await fetchAll();
  }

  async function remove(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
  }

  return { users, loading, fetchAll, create, update, remove };
});
```

---

### 2-3. `src/features/system/menu-store.ts` (신규)

**역할**: 메뉴 목록 상태 보관 및 CRUD API 호출 캡슐화.

```typescript
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { MenuDto, MenuCreateDto, MenuUpdateDto } from 'src/types';

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<MenuDto[]>([]);
  const loading = ref(false);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    try {
      const res = await api.get<MenuDto[]>('/api/menus');
      menus.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: MenuCreateDto): Promise<void> {
    await api.post<MenuDto>('/api/menus', payload);
    await fetchAll();
  }

  async function update(id: number, payload: MenuUpdateDto): Promise<void> {
    await api.put<MenuDto>(`/api/menus/${id}`, payload);
    await fetchAll();
  }

  async function remove(id: number): Promise<void> {
    await api.delete(`/api/menus/${id}`);
    menus.value = menus.value.filter((m) => m.id !== id);
  }

  return { menus, loading, fetchAll, create, update, remove };
});
```

---

### 2-4. `src/features/system/UserManagePage.vue` (신규)

**역할**: 사용자 CRUD 관리 화면. AG Grid(읽기 전용) + q-dialog(등록/수정).

#### 템플릿 구조

```
UserManagePage
├── div.q-pa-md
│   ├── div.row.items-center.q-mb-md  (제목 + 등록 버튼)
│   │   ├── span.text-h6  "사용자 관리"
│   │   └── q-btn  "+ 등록"
│   └── AppGrid  (읽기 전용 목록)
│       └── [관리 컬럼: 수정 버튼 / 삭제 버튼]  ← cellRenderer
│
├── q-dialog (등록/수정 다이얼로그)
│   └── q-card
│       ├── q-card-section  제목 ("사용자 등록" / "사용자 수정")
│       ├── q-card-section  폼
│       │   ├── q-input  userId  (등록 시만 활성화)
│       │   ├── q-input  userName
│       │   ├── q-input  email   type="email"
│       │   └── q-input  password  type="password"  (등록 시만 표시)
│       └── q-card-actions
│           ├── q-btn  "취소"
│           └── q-btn  "저장"
│
└── q-dialog (삭제 확인 다이얼로그)
    └── q-card
        ├── q-card-section  "삭제 확인"
        ├── q-card-section  "{userName} 사용자를 삭제할까요?"
        └── q-card-actions
            ├── q-btn  "취소"
            └── q-btn  "삭제"  color="negative"
```

#### 전체 구현 스펙

```vue
<template>
  <div class="q-pa-md">
    <!-- 헤더 -->
    <div class="row items-center q-mb-md">
      <span class="text-h6">사용자 관리</span>
      <q-space />
      <q-btn color="primary" icon="add" label="등록" @click="openCreate" />
    </div>

    <!-- 목록 그리드 -->
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
        <q-card-section> "{{ confirmDelete.userName }}" 사용자를 삭제할까요? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" @click="confirmDelete.open = false" />
          <q-btn color="negative" label="삭제" :loading="saving" @click="handleDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { ColDef, GridReadyEvent } from 'src/types/grid';
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
    cellRenderer: (params: { data: UserDto }) => {
      const editBtn = `<button class="q-btn q-btn--flat q-btn--dense text-primary" data-id="${params.data.id}" data-action="edit">수정</button>`;
      const delBtn = `<button class="q-btn q-btn--flat q-btn--dense text-negative" data-id="${params.data.id}" data-name="${params.data.userName}" data-action="delete">삭제</button>`;
      return editBtn + ' ' + delBtn;
    },
  },
];

// ── 이벤트 핸들러 ────────────────────────────────────
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

// ── 그리드 셀 클릭 처리 (cellRenderer 버튼) ─────────
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
</script>
```

> **참고**: `cellRenderer`의 버튼 클릭은 AG Grid 이벤트 버블링으로 document에서 처리한다.
> 컴포넌트 unmount 시 이벤트 리스너를 제거해야 한다. (설계 단순화를 위해 onUnmounted 처리는 Do 단계에서 추가)

---

### 2-5. `src/features/system/MenuManagePage.vue` (신규)

**역할**: 메뉴 CRUD 관리 화면. AG Grid(읽기 전용) + q-dialog(등록/수정).

#### 템플릿 구조

```
MenuManagePage
├── div.q-pa-md
│   ├── div.row.items-center.q-mb-md  (제목 + 등록 버튼)
│   └── AppGrid  (읽기 전용 목록)
│
├── q-dialog (등록/수정 다이얼로그)
│   └── q-card
│       ├── q-card-section  제목
│       ├── q-card-section  폼
│       │   ├── q-input   menuCode  (등록 시만 활성화)
│       │   ├── q-input   menuName
│       │   ├── q-input   menuUrl
│       │   ├── q-input   menuOrder  type="number"
│       │   ├── q-select  parentId  (메뉴 목록에서 선택)
│       │   ├── q-input   icon
│       │   ├── q-select  allowedRoles  multiple  (ADMIN, USER 등)
│       │   └── q-toggle  isActive
│       └── q-card-actions
│
└── q-dialog (삭제 확인 다이얼로그)
```

#### 전체 구현 스펙

```vue
<template>
  <div class="q-pa-md">
    <div class="row items-center q-mb-md">
      <span class="text-h6">메뉴 관리</span>
      <q-space />
      <q-btn color="primary" icon="add" label="등록" @click="openCreate" />
    </div>

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
        <q-card-section> "{{ confirmDelete.menuName }}" 메뉴를 삭제할까요? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" @click="confirmDelete.open = false" />
          <q-btn color="negative" label="삭제" :loading="saving" @click="handleDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
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
    cellRenderer: (params: { data: MenuDto }) => {
      const editBtn = `<button data-id="${params.data.id}" data-action="edit">수정</button>`;
      const delBtn = `<button data-id="${params.data.id}" data-name="${params.data.menuName}" data-action="delete">삭제</button>`;
      return editBtn + ' ' + delBtn;
    },
  },
];

// ── 이벤트 핸들러 ────────────────────────────────────
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

async function handleSave(): Promise<void> {
  saving.value = true;
  try {
    if (dialog.isEdit && dialog.editId !== null) {
      await menuStore.update(dialog.editId, {
        menuName: form.menuName,
        menuUrl: form.menuUrl || undefined,
        menuOrder: form.menuOrder,
        parentId: form.parentId,
        icon: form.icon || undefined,
        allowedRoles: form.allowedRoles,
        isActive: form.isActive,
      });
    } else {
      await menuStore.create({
        menuCode: form.menuCode,
        menuName: form.menuName,
        menuUrl: form.menuUrl || undefined,
        menuOrder: form.menuOrder,
        parentId: form.parentId,
        icon: form.icon || undefined,
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
</script>
```

---

### 2-6. `src/features/workspace/menu.config.ts` (수정)

**변경 내용**: `시스템관리` 서브 메뉴의 `component` 값을 실제 컴포넌트명으로 교체.

```typescript
// Before
{ name: 'user-mgmt', label: '사용자관리', component: 'SamplePage', props: { pageTitle: '사용자관리' } }
{ name: 'menu-mgmt', label: '메뉴관리',   component: 'SamplePage', props: { pageTitle: '메뉴관리'   } }

// After
{ name: 'user-mgmt', label: '사용자관리', component: 'UserManagePage' }
{ name: 'menu-mgmt', label: '메뉴관리',   component: 'MenuManagePage' }
```

> `props` 제거: `UserManagePage`, `MenuManagePage`는 외부 props를 받지 않는다.

---

### 2-7. `src/features/workspace/MainLayout.vue` (수정)

**변경 내용**: `componentMap`에 신규 컴포넌트 2개 추가.

```typescript
// Before
import SamplePage from '../shared/SamplePage.vue';

const componentMap: Record<string, Component> = {
  IndexPage,
  SamplePage,
};

// After
import SamplePage from '../shared/SamplePage.vue';
import UserManagePage from '../system/UserManagePage.vue';
import MenuManagePage from '../system/MenuManagePage.vue';

const componentMap: Record<string, Component> = {
  IndexPage,
  SamplePage,
  UserManagePage,
  MenuManagePage,
};
```

---

## 3. 디렉토리 구조 (최종)

```
src/
├── types/
│   └── index.ts              ← 수정: UserDto, MenuDto 등 타입 추가
│
└── features/
    ├── system/               ← 신규 도메인 모듈
    │   ├── UserManagePage.vue
    │   ├── MenuManagePage.vue
    │   ├── user-store.ts
    │   └── menu-store.ts
    │
    └── workspace/
        ├── menu.config.ts    ← 수정: 컴포넌트명 교체
        └── MainLayout.vue    ← 수정: componentMap 추가
```

---

## 4. 데이터 흐름 (최종)

```
시스템관리 > 사용자관리 클릭
  │
  └─ MainLayout.openSubMenuTab('user-mgmt')
       └─ TabStore.openTab({ component: 'UserManagePage' })
            └─ componentMap['UserManagePage'] → UserManagePage.vue 렌더링
                 └─ onMounted → useUserStore.fetchAll() → GET /api/users
                      └─ AppGrid (읽기 전용 목록 표시)
                           └─ 수정/삭제 버튼 클릭
                                ├─ 수정: q-dialog 열기 → PUT /api/users/{id}
                                └─ 삭제: 확인 dialog → DELETE /api/users/{id}
```

---

## 5. 검증 항목 (총 20개)

### 타입/빌드

| #   | 항목            | 기준                         |
| --- | --------------- | ---------------------------- |
| 1   | TypeScript 타입 | `vue-tsc --noEmit` 오류 없음 |
| 2   | ESLint          | `npm run lint` 오류 없음     |
| 3   | 빌드            | `npm run build` 오류 없음    |

### 사용자관리

| #   | 항목            | 기준                                     |
| --- | --------------- | ---------------------------------------- |
| 4   | 목록 조회       | 탭 열기 시 AG Grid에 사용자 목록 표시    |
| 5   | 로딩 표시       | 조회 중 그리드에 로딩 오버레이 표시      |
| 6   | 등록 다이얼로그 | "+ 등록" 클릭 시 빈 폼 다이얼로그 열림   |
| 7   | userId 비활성화 | 수정 다이얼로그에서 userId 입력 비활성   |
| 8   | password 숨김   | 수정 다이얼로그에서 password 필드 미표시 |
| 9   | 사용자 등록     | 저장 → POST /api/users → 목록 갱신       |
| 10  | 사용자 수정     | 저장 → PUT /api/users/{id} → 목록 갱신   |
| 11  | 사용자 삭제     | 삭제 확인 → DELETE → 목록에서 제거       |

### 메뉴관리

| #   | 항목            | 기준                                    |
| --- | --------------- | --------------------------------------- |
| 12  | 목록 조회       | 탭 열기 시 AG Grid에 메뉴 목록 표시     |
| 13  | menuCode 비활성 | 수정 시 menuCode 입력 비활성            |
| 14  | 다중 역할 선택  | allowedRoles q-select 다중 선택 동작    |
| 15  | 상위 메뉴 선택  | parentId q-select에 현재 메뉴 목록 표시 |
| 16  | 활성화 토글     | isActive q-toggle 저장에 반영           |
| 17  | 메뉴 등록       | 저장 → POST /api/menus → 목록 갱신      |
| 18  | 메뉴 수정       | 저장 → PUT /api/menus/{id} → 목록 갱신  |
| 19  | 메뉴 삭제       | 삭제 확인 → DELETE → 목록에서 제거      |

### 공통

| #   | 항목          | 기준                                                 |
| --- | ------------- | ---------------------------------------------------- |
| 20  | JWT 자동 첨부 | API 요청 헤더에 `Authorization: Bearer {token}` 포함 |
