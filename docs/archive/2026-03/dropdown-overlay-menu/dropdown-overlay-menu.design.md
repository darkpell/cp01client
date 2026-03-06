# [Design] dropdown-overlay-menu

## 메타 정보

| 항목      | 내용                                                  |
| --------- | ----------------------------------------------------- |
| 기능명    | dropdown-overlay-menu                                 |
| 작성일    | 2026-03-04                                            |
| 참조 Plan | `docs/01-plan/features/dropdown-overlay-menu.plan.md` |
| 상태      | Design                                                |
| 변경 파일 | `src/layouts/MainLayout.vue` (단일 파일)              |

---

## 1. 변경 개요

### Before / After

```
[Before]  q-layout
            ├── q-header
            │     ├── q-toolbar (탑 메뉴)
            │     └── transition > div.submenu-bar  ← 헤더 내부 (문제)
            └── q-page-container

[After]   q-layout
            ├── q-header
            │     └── q-toolbar (탑 메뉴)            ← 높이 고정
            ├── transition > div.submenu-overlay     ← 헤더 외부 (신규)
            └── q-page-container
```

---

## 2. Template 설계

### 2.1 제거할 코드 (q-header 내부)

```vue
<!-- 제거: q-header 마지막 자식 -->
<transition name="submenu">
  <div v-if="activeMenu" class="submenu-bar" @click.stop>
    <q-toolbar dense class="bg-blue-8">
      <template v-for="menu in menuConfig" :key="menu.id">
        <template v-if="activeMenu === menu.id">
          <q-btn
            v-for="item in menu.children"
            :key="item.name"
            flat
            dense
            :label="item.label"
            class="q-mr-xs"
            @click="openSubMenuTab(item)"
          />
        </template>
      </template>
    </q-toolbar>
  </div>
</transition>
```

### 2.2 추가할 코드 (q-layout 직하위, q-header 바로 다음)

```vue
<!-- 신규: q-header 닫힘 태그 바로 뒤 -->
<transition name="submenu">
  <div v-if="activeMenu" class="submenu-overlay" @click.stop>
    <q-toolbar dense class="bg-blue-8">
      <template v-for="menu in menuConfig" :key="menu.id">
        <template v-if="activeMenu === menu.id">
          <q-btn
            v-for="item in menu.children"
            :key="item.name"
            flat
            dense
            :label="item.label"
            class="q-mr-xs"
            @click="openSubMenuTab(item)"
          />
        </template>
      </template>
    </q-toolbar>
  </div>
</transition>
```

### 2.3 최종 Template 구조

```vue
<template>
  <q-layout view="hHh lpR fFf" @click="closeSubMenu">
    <!-- ── 상단 헤더 (고정 높이 유지) ── -->
    <q-header elevated>
      <q-toolbar>
        <!-- 기존 내용 그대로 유지 -->
        <q-icon name="apps" size="28px" class="q-mr-sm" />
        <q-toolbar-title shrink class="q-mr-lg">CP01 시스템</q-toolbar-title>
        <q-btn v-for="menu in menuConfig" ... />
        <q-space />
        <span ...>{{ authStore.userId }}</span>
        <q-btn flat dense icon="logout" ... />
      </q-toolbar>
      <!-- submenu 제거됨 -->
    </q-header>

    <!-- ── 오버레이 서브 메뉴 (헤더 외부, 콘텐츠 위에 겹침) ── -->
    <transition name="submenu">
      <div v-if="activeMenu" class="submenu-overlay" @click.stop>
        <q-toolbar dense class="bg-blue-8">
          <template v-for="menu in menuConfig" :key="menu.id">
            <template v-if="activeMenu === menu.id">
              <q-btn
                v-for="item in menu.children"
                :key="item.name"
                flat
                dense
                :label="item.label"
                class="q-mr-xs"
                @click="openSubMenuTab(item)"
              />
            </template>
          </template>
        </q-toolbar>
      </div>
    </transition>

    <!-- ── 콘텐츠 영역 (변경 없음) ── -->
    <q-page-container>
      <!-- 기존 내용 그대로 유지 -->
    </q-page-container>
  </q-layout>
</template>
```

---

## 3. CSS 설계

### 3.1 제거할 CSS 클래스

```css
/* 제거: submenu-bar 클래스 (더 이상 사용하지 않음) */
/* 참고: submenu 전환 애니메이션(.submenu-*)은 유지 */
```

### 3.2 추가할 CSS 클래스

```css
/* 신규: 오버레이 포지셔닝 */
.submenu-overlay {
  position: fixed; /* 스크롤에 무관하게 뷰포트 기준 고정 */
  top: 50px; /* q-header / q-toolbar 기본 높이 = 50px */
  left: 0;
  right: 0;
  z-index: 5999; /* q-header(6000) 아래, 일반 콘텐츠 위 */
}
```

### 3.3 유지할 CSS (변경 없음)

```css
/* 기존 transition 애니메이션 — 그대로 재사용 */
.submenu-enter-active,
.submenu-leave-active {
  transition:
    max-height 0.2s ease,
    opacity 0.2s ease;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
.submenu-enter-to,
.submenu-leave-from {
  max-height: 48px;
  opacity: 1;
}
```

### 3.4 z-index 레이어 구조

```
z-index 레이어 (높을수록 앞에 표시)
─────────────────────────────────────
  6000  │  q-header (Quasar 기본값)
  5999  │  .submenu-overlay (신규)  ← 헤더 아래, 콘텐츠 위
  ---   │  q-page-container (일반 흐름)
```

> **주의**: Quasar의 q-header 기본 z-index는 6000입니다.
> `.submenu-overlay`를 5999로 설정하면 오버레이가 헤더 영역과
> 겹치지 않으면서 콘텐츠 위에 표시됩니다.

---

## 4. 인터랙션 설계

### 4.1 상태 흐름

```
[초기 상태]
  activeMenu = null
  서브 메뉴 비표시

[탑 메뉴 버튼 클릭] → toggleMenu(menuId)
  ├─ activeMenu === null      → activeMenu = menuId  (열기)
  ├─ activeMenu === menuId    → activeMenu = null    (닫기, 토글)
  └─ activeMenu !== menuId   → activeMenu = menuId  (다른 메뉴로 전환)

[서브 메뉴 아이템 클릭] → openSubMenuTab(item)
  → tabStore.openTab(tab)
  → activeMenu = null  (닫기)

[외부 영역 클릭] → closeSubMenu()  (q-layout @click)
  → activeMenu = null

[서브 메뉴 영역 클릭] → @click.stop  (버블링 차단)
  → activeMenu 유지
```

### 4.2 시각적 피드백

| 상태          | 탑 메뉴 버튼       | 서브 메뉴              |
| ------------- | ------------------ | ---------------------- |
| 비활성        | 기본 스타일        | 비표시                 |
| 활성 (클릭됨) | `bg-blue-8` 배경색 | 표시 (슬라이드 인)     |
| 닫힘          | 기본 스타일        | 비표시 (슬라이드 아웃) |

### 4.3 애니메이션 명세

- **열기**: `max-height: 0 → 48px`, `opacity: 0 → 1`, 시간: 200ms, easing: ease
- **닫기**: `max-height: 48px → 0`, `opacity: 1 → 0`, 시간: 200ms, easing: ease

---

## 5. Script 설계

### 5.1 변경 없는 로직 (기존 그대로 유지)

```typescript
// 모두 유지
const activeMenu = ref<string | null>(null)
function toggleMenu(menuId: string) { ... }
function closeSubMenu() { ... }
function openSubMenuTab(item: SubMenuItem) { ... }
```

### 5.2 추가/수정 없음

Script 영역은 **일체 변경하지 않는다**. Template과 CSS 변경만으로 기능 완성.

---

## 6. 헤더 높이 계산 근거

| 환경           |  q-toolbar 기본 높이  |
| -------------- | :-------------------: |
| Desktop        |         50px          |
| Mobile (dense) |         40px          |
| 현재 설정      | dense 아님 → **50px** |

```css
/* 현재 코드에서 q-header에 dense 옵션 없음 → 50px 사용 */
top: 50px;
```

> 향후 헤더 높이 변경 시 이 값을 함께 수정해야 합니다.
> CSS 변수로 관리하려면: `:root { --header-height: 50px; }`

---

## 7. 구현 체크리스트 (Do Phase용)

### Template 변경

- [ ] `<q-header>` 내부에서 `<transition name="submenu">` 블록 완전 제거
- [ ] `</q-header>` 닫힘 태그 다음 줄에 새 `<transition>` 블록 추가
- [ ] 새 `<div>`의 클래스를 `submenu-bar` → `submenu-overlay`로 변경

### CSS 변경

- [ ] `.submenu-bar` 클래스 제거 (스타일 없었으므로 삭제 불필요, 참조만 제거)
- [ ] `.submenu-overlay` 클래스 추가 (`position: fixed; top: 50px; left: 0; right: 0; z-index: 5999;`)
- [ ] `.submenu-enter/leave` 애니메이션 **유지** (변경 없음)

### 검증

- [ ] 탑 메뉴 클릭 시 헤더 높이 변화 없음
- [ ] 서브 메뉴가 콘텐츠 위에 겹쳐 표시됨
- [ ] 외부 클릭 시 닫힘
- [ ] 서브 메뉴 클릭 시 탭 열림 + 닫힘
- [ ] 다른 탑 메뉴 클릭 시 즉시 전환
- [ ] 애니메이션 정상 동작

---

## 8. 다음 단계

```
/pdca do dropdown-overlay-menu
```
