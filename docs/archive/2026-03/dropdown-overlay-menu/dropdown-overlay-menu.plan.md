# [Plan] dropdown-overlay-menu

## 메타 정보

| 항목     | 내용                  |
| -------- | --------------------- |
| 기능명   | dropdown-overlay-menu |
| 작성일   | 2026-03-04            |
| 작성자   | Claude Code           |
| 상태     | Plan                  |
| 우선순위 | 중간                  |

---

## 1. 배경 및 목적

### 현재 문제점

현재 `MainLayout.vue`의 상단 메뉴(top navigation)는 서브 메뉴를 **헤더 내부**에 렌더링한다.
탑 메뉴 버튼 클릭 시 `<q-header>` 높이가 늘어나며 서브 메뉴 바가 **아래로 밀려 표시**된다.

```
[현재 동작]
┌──────────────────────────────────┐
│  헤더: 업무관리 | 시스템관리      │  ← 클릭 전
└──────────────────────────────────┘
│  콘텐츠 영역                     │

클릭 후 ↓

┌──────────────────────────────────┐
│  헤더: 업무관리 | 시스템관리      │
├──────────────────────────────────┤  ← 헤더가 커짐 (서브 메뉴가 헤더 일부)
│  서브 메뉴: 메뉴1 | 메뉴2        │
└──────────────────────────────────┘
│  콘텐츠 영역 (위로 밀림)         │
```

### 목표 동작

탑 메뉴 클릭 시 **메인 레이아웃(헤더)은 고정**된 상태로, 서브 메뉴가 헤더 아래에
**화면을 덮는 오버레이(overlay)** 형태로 표시된다. 콘텐츠 영역은 밀리지 않는다.

```
[목표 동작]
┌──────────────────────────────────┐
│  헤더: 업무관리 | 시스템관리      │  ← 고정 (높이 변화 없음)
└──────────────────────────────────┘
│ ┌──────────────────────────────┐  │  ← 드롭다운이 콘텐츠 위에 겹침
│ │  서브 메뉴: 메뉴1 | 메뉴2    │  │     (overlay, z-index 활용)
│ └──────────────────────────────┘  │
│  콘텐츠 영역 (이동 없음)          │
```

---

## 2. 기능 요구사항

### 필수 요구사항 (Must Have)

| ID   | 요구사항                                                         |
| ---- | ---------------------------------------------------------------- |
| R-01 | 탑 메뉴 클릭 시 헤더 높이가 변하지 않아야 한다                   |
| R-02 | 서브 메뉴는 헤더 바로 아래에 오버레이(overlay)로 표시되어야 한다 |
| R-03 | 서브 메뉴는 콘텐츠 위에 겹쳐 표시되어야 한다 (z-index 활용)      |
| R-04 | 서브 메뉴 외부 영역 클릭 시 드롭다운이 닫혀야 한다               |
| R-05 | 서브 메뉴 아이템 클릭 시 해당 탭이 열리고 드롭다운이 닫혀야 한다 |
| R-06 | 현재 활성화된 탑 메뉴 버튼은 강조 표시되어야 한다                |

### 선택 요구사항 (Nice to Have)

| ID   | 요구사항                                                         |
| ---- | ---------------------------------------------------------------- |
| R-07 | 드롭다운 열림/닫힘 시 부드러운 애니메이션 (현재 transition 유지) |
| R-08 | 드롭다운이 열린 상태에서 다른 탑 메뉴 클릭 시 즉시 전환          |

---

## 3. 현재 구현 분석

### 현재 코드 구조 (`src/layouts/MainLayout.vue`)

```
<q-layout>
  <q-header>
    <q-toolbar>
      탑 메뉴 버튼들 (v-for menuConfig)
    </q-toolbar>
    <transition name="submenu">          ← 문제 위치
      <div v-if="activeMenu" class="submenu-bar">
        서브 메뉴 버튼들
      </div>
    </transition>
  </q-header>
  <q-page-container> ... </q-page-container>
</q-layout>
```

**문제**: `<transition>` 블록이 `<q-header>` **내부**에 있어 헤더 DOM이 변형됨.

### 관련 CSS

```css
.submenu-enter-active,
.submenu-leave-active {
  transition:
    max-height 0.2s ease,
    opacity 0.2s ease;
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

---

## 4. 구현 방향

### 선택 방안: Fixed Position Overlay

서브 메뉴 `<div>`를 `<q-header>` **외부**로 이동하고,
`position: fixed`와 `top: 50px`(헤더 높이), `z-index`로 오버레이 구현.

**선택 이유**:

- 기존 `activeMenu` ref, `toggleMenu()`, `closeSubMenu()` 로직 **재사용 가능**
- 기존 `transition` 애니메이션 **재사용 가능**
- Quasar 의존성 추가 없음 (QMenu, QPopupProxy 불필요)
- 코드 변경 최소화

**구현 위치**: `<q-layout>` 직하위 (q-header와 동일 레벨)

```vue
<q-layout view="hHh lpR fFf" @click="closeSubMenu">
  <q-header elevated>
    <q-toolbar> ... </q-toolbar>
    <!-- ↑ submenu-bar 제거 -->
  </q-header>

  <!-- ↓ 새로운 오버레이 위치 (q-header 외부) -->
  <transition name="submenu">
    <div v-if="activeMenu" class="submenu-overlay" @click.stop>
      <q-toolbar dense class="bg-blue-8">
        서브 메뉴 버튼들
      </q-toolbar>
    </div>
  </transition>

  <q-page-container> ... </q-page-container>
</q-layout>
```

```css
.submenu-overlay {
  position: fixed;
  top: 50px; /* q-header 높이 */
  left: 0;
  right: 0;
  z-index: 6000; /* Quasar q-header z-index(6000) + 1 */
}
```

### 대안 방안: Quasar QMenu 컴포넌트

각 탑 메뉴 버튼에 `<q-menu>` 첨부. 더 단순하지만 현재 UI 스타일(가로 바 형태)과 다름.

```vue
<q-btn v-for="menu in menuConfig" :key="menu.id" flat :label="menu.label">
  <q-menu>
    <q-list>
      <q-item v-for="item in menu.children" clickable @click="openSubMenuTab(item)">
        {{ item.label }}
      </q-item>
    </q-list>
  </q-menu>
</q-btn>
```

**비선택 이유**: 현재 UI가 "가로형 서브 메뉴 바" 형태인데, QMenu는 세로 리스트가 기본.

---

## 5. 구현 범위 (Scope)

### 변경 파일

| 파일                         | 변경 내용                      |
| ---------------------------- | ------------------------------ |
| `src/layouts/MainLayout.vue` | 서브 메뉴 위치 이동 + CSS 수정 |

### 변경 불필요 파일

| 파일                   | 이유                |
| ---------------------- | ------------------- |
| `stores/tab-store.ts`  | 탭 로직 변경 없음   |
| `stores/auth-store.ts` | 인증 로직 변경 없음 |
| `router/`              | 라우터 변경 없음    |
| 페이지 컴포넌트        | 변경 없음           |

---

## 6. 위험 요소 및 대응

| 위험                            | 가능성 | 대응                                 |
| ------------------------------- | :----: | ------------------------------------ |
| Quasar `q-header` z-index 충돌  |  중간  | z-index 값 테스트로 확인 (6001 권장) |
| 헤더 높이가 50px 아닌 경우      |  낮음  | CSS `var()` 또는 JS로 동적 계산      |
| 모바일 환경 렌더링 이슈         |  낮음  | `position: fixed` 모바일 테스트      |
| 기존 transition 애니메이션 이상 |  낮음  | max-height 값 재조정                 |

---

## 7. 완료 조건 (Definition of Done)

- [ ] 탑 메뉴 클릭 시 헤더 높이 변화 없음 확인
- [ ] 서브 메뉴가 콘텐츠 위에 오버레이로 표시됨 확인
- [ ] 외부 클릭 시 드롭다운 닫힘 확인
- [ ] 서브 메뉴 아이템 클릭 시 탭 열림 + 드롭다운 닫힘 확인
- [ ] 애니메이션(transition) 정상 동작 확인
- [ ] 다른 탑 메뉴 클릭 시 즉시 전환 확인
- [ ] ESLint, TypeScript 오류 없음

---

## 8. 다음 단계

```
/pdca design dropdown-overlay-menu
```
