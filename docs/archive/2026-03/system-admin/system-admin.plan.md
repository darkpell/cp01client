# [Plan] system-admin

## 메타 정보

| 항목     | 내용         |
| -------- | ------------ |
| 기능명   | system-admin |
| 작성일   | 2026-03-06   |
| 작성자   | Claude Code  |
| 상태     | Plan         |
| 우선순위 | 높음         |

---

## 1. 배경 및 목적

### 현재 문제점

`시스템관리` 메뉴의 `사용자관리`와 `메뉴관리` 화면이 현재 `SamplePage.vue` 플레이스홀더로 대체되어 있다.
CP01SERVER에 사용자/메뉴 CRUD API가 완성되어 있으나 프론트엔드 관리 화면이 없어 실제 운영이 불가능하다.

### 목표

- CP01SERVER의 `/api/users`, `/api/menus` API를 연동한 실제 관리 화면 구현
- 기존 `시스템관리` 메뉴 하위의 플레이스홀더를 실제 페이지 컴포넌트로 교체
- AG Grid 기반의 일관된 목록 화면 + 다이얼로그 기반 CRUD UX 제공

### 비즈니스 가치

| 항목        | 설명                                                   |
| ----------- | ------------------------------------------------------ |
| 운영 편의   | 관리자가 UI에서 직접 사용자/메뉴를 관리 가능           |
| 데이터 정합 | API 응답 기반 실시간 데이터 표시                       |
| 확장성      | Feature Module 구조로 추후 권한 관리 등 기능 추가 용이 |

---

## 2. 범위 (Scope)

### IN (이번에 구현)

**사용자관리 (`UserManagePage.vue`)**

- 전체 사용자 목록 조회 → AG Grid 표시
- 사용자 등록 (다이얼로그: userId, userName, email, password)
- 사용자 수정 (다이얼로그: userName, email)
- 사용자 삭제 (확인 다이얼로그)

**메뉴관리 (`MenuManagePage.vue`)**

- 전체 메뉴 목록 조회 → AG Grid 표시 (평면 구조)
- 메뉴 등록 (다이얼로그: menuCode, menuName, menuUrl, menuOrder, parentId, icon, allowedRoles, isActive)
- 메뉴 수정 (다이얼로그: menuName, menuUrl, menuOrder, parentId, icon, allowedRoles, isActive)
- 메뉴 삭제 (확인 다이얼로그)

**공통**

- JWT 인증 헤더 자동 포함 (기존 axios boot 활용)
- Pinia Setup Store로 상태 관리
- `menu.config.ts` 컴포넌트명 교체
- `MainLayout.vue` componentMap 추가

### OUT (이번 범위 제외)

- 권한(Role) 관리 화면 (별도 기능)
- 메뉴 트리 계층 편집 UI (`/api/menus/tree`)
- 역할 기반 접근 제어(`/api/menus/accessible`) 연동
- 비밀번호 변경 기능

---

## 3. CP01SERVER API 명세

### 3-1. 사용자 API (`/api/users`)

| Method | Endpoint          | 설명           | Request Body        | Response         |
| :----: | ----------------- | -------------- | ------------------- | ---------------- |
|  GET   | `/api/users`      | 전체 목록 조회 | -                   | `UserResponse[]` |
|  GET   | `/api/users/{id}` | 단건 조회      | -                   | `UserResponse`   |
|  POST  | `/api/users`      | 사용자 생성    | `UserCreateRequest` | `UserResponse`   |
|  PUT   | `/api/users/{id}` | 사용자 수정    | `UserUpdateRequest` | `UserResponse`   |
| DELETE | `/api/users/{id}` | 사용자 삭제    | -                   | 204 No Content   |

**UserResponse 필드**:

| 필드       | 타입     | 설명      |
| ---------- | -------- | --------- |
| `id`       | `number` | PK        |
| `userId`   | `string` | 사용자 ID |
| `userName` | `string` | 사용자명  |
| `email`    | `string` | 이메일    |
| `role`     | `string` | 역할      |

**UserCreateRequest 필드**:

| 필드       | 타입     | 필수 | 제약        |
| ---------- | -------- | :--: | ----------- |
| `userId`   | `string` |  ✅  | 최대 10자   |
| `userName` | `string` |  ✅  | -           |
| `email`    | `string` |  ✅  | 이메일 형식 |
| `password` | `string` |  ✅  | 최소 8자    |

**UserUpdateRequest 필드** (userId, password 수정 불가):

| 필드       | 타입     | 필수 |
| ---------- | -------- | :--: |
| `userName` | `string` |  ✅  |
| `email`    | `string` |  ✅  |

---

### 3-2. 메뉴 API (`/api/menus`)

| Method | Endpoint                | 설명                | Request Body        | Response             |
| :----: | ----------------------- | ------------------- | ------------------- | -------------------- |
|  GET   | `/api/menus`            | 전체 목록 (평면)    | -                   | `MenuResponse[]`     |
|  GET   | `/api/menus/tree`       | 계층 트리           | -                   | `MenuTreeResponse[]` |
|  GET   | `/api/menus/accessible` | 역할 기반 접근 메뉴 | -                   | `MenuResponse[]`     |
|  GET   | `/api/menus/{id}`       | 단건 조회           | -                   | `MenuResponse`       |
|  POST  | `/api/menus`            | 메뉴 생성 (ADMIN)   | `MenuCreateRequest` | `MenuResponse`       |
|  PUT   | `/api/menus/{id}`       | 메뉴 수정 (ADMIN)   | `MenuUpdateRequest` | `MenuResponse`       |
| DELETE | `/api/menus/{id}`       | 메뉴 삭제 (ADMIN)   | -                   | 204 No Content       |

**MenuResponse 필드**:

| 필드           | 타입             | 설명           |
| -------------- | ---------------- | -------------- |
| `id`           | `number`         | PK             |
| `menuCode`     | `string`         | 메뉴 코드      |
| `menuName`     | `string`         | 메뉴명         |
| `menuUrl`      | `string \| null` | URL            |
| `menuOrder`    | `number`         | 정렬 순서      |
| `parentId`     | `number \| null` | 상위 메뉴 ID   |
| `icon`         | `string \| null` | 아이콘         |
| `allowedRoles` | `string[]`       | 허용 역할 목록 |
| `isActive`     | `boolean`        | 활성화 여부    |
| `createdAt`    | `string`         | 생성일시       |
| `updatedAt`    | `string`         | 수정일시       |

**MenuCreateRequest 필드**:

| 필드           | 타입       | 필수 | 제약                             |
| -------------- | ---------- | :--: | -------------------------------- |
| `menuCode`     | `string`   |  ✅  | 대문자·숫자·언더스코어, 최대50자 |
| `menuName`     | `string`   |  ✅  | 최대 100자                       |
| `menuUrl`      | `string`   |  -   | 최대 255자                       |
| `menuOrder`    | `number`   |  -   | 기본값 0                         |
| `parentId`     | `number`   |  -   | 상위 메뉴 ID                     |
| `icon`         | `string`   |  -   | 최대 100자                       |
| `allowedRoles` | `string[]` |  ✅  | 역할 목록                        |
| `isActive`     | `boolean`  |  -   | 기본값 true                      |

---

## 4. 아키텍처 설계

### 디렉토리 구조

```
src/features/system/                    ← 신규 도메인 모듈
├── UserManagePage.vue                  ← 사용자 관리 페이지
├── MenuManagePage.vue                  ← 메뉴 관리 페이지
├── user-store.ts                       ← 사용자 Pinia 스토어
└── menu-store.ts                       ← 메뉴 Pinia 스토어
```

### 수정 파일

```
src/features/workspace/
├── menu.config.ts                      ← 컴포넌트명 교체
└── MainLayout.vue                      ← componentMap 추가

src/types/
└── index.ts                            ← UserDto, MenuDto 타입 추가
```

### 데이터 흐름

```
UserManagePage.vue
  │
  ├─ useUserStore()   →  GET /api/users
  │   ├─ users[]          POST /api/users
  │   ├─ createUser()     PUT  /api/users/{id}
  │   ├─ updateUser()     DELETE /api/users/{id}
  │   └─ deleteUser()
  │
  └─ AppGrid (목록 표시) + q-dialog (CRUD 폼)

MenuManagePage.vue
  │
  ├─ useMenuStore()   →  GET /api/menus
  │   ├─ menus[]          POST /api/menus
  │   ├─ createMenu()     PUT  /api/menus/{id}
  │   ├─ updateMenu()     DELETE /api/menus/{id}
  │   └─ deleteMenu()
  │
  └─ AppGrid (목록 표시) + q-dialog (CRUD 폼)
```

---

## 5. UX 방식 결정: 다이얼로그 vs 인라인 그리드 편집

### 5-1. 비교 분석

#### 안전성(Safety)

| 항목           |          다이얼로그 방식           |            인라인 그리드 편집             |
| -------------- | :--------------------------------: | :---------------------------------------: |
| 실수 방지      | 열기 → 입력 → 저장 2단계 의도 확인 |    셀 클릭 즉시 편집 진입 (실수 위험)     |
| 원자성         | 모든 필드를 PUT 1회로 원자적 저장  | 필드 단위 저장 → 중간 실패 시 일부만 반영 |
| password 처리  | `type="password"` 자연스럽게 처리  |     **인라인 구현 불가 — 보안 취약**      |
| 취소 안전성    |       취소 시 서버 요청 없음       |           저장된 셀은 롤백 불가           |
| 교차 필드 검증 |     폼 전체 묶어서 한번에 검사     |   셀 단위 검사 — 연관 필드 검증 어려움    |

#### 성능(Performance)

| 항목          |       다이얼로그 방식       |         인라인 그리드 편집          |
| ------------- | :-------------------------: | :---------------------------------: |
| API 호출 수   |     수정 1회 = PUT 1회      |    필드 N개 수정 = PUT 최대 N회     |
| 네트워크 부하 |            낮음             |   높음 (불필요한 중간 상태 저장)    |
| 렌더링 비용   |  간단한 다이얼로그 레이어   |  AG Grid 내부 cellEditor 상태 관리  |
| 구현 복잡도   | 낮음 — Quasar q-dialog 활용 | 높음 — Vue 3 커스텀 cellEditor 필요 |

#### 이 프로젝트 특수 요인

| 요인                            | 판정                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `password` 필드 (사용자 등록)   | 인라인 처리 **불가** — 보안 필수                          |
| `allowedRoles: string[]` (메뉴) | 배열 타입을 인라인 편집하려면 커스텀 cellEditor 개발 필요 |
| `isActive: boolean` (메뉴)      | 토글 가능하나 단독 필드 수정 → 원자성 파괴                |
| 관리자 운영 데이터              | 실수 수정이 치명적 → 명시적 저장 확인 필수                |

### 5-2. 결정: **다이얼로그 방식 채택**

> **근거**: 이 화면의 필드에는 `password`(인라인 불가), `allowedRoles: string[]`(배열 타입),
> `isActive`(bool 토글) 등 인라인 편집이 부적합하거나 구현 복잡도가 높은 필드가 포함되어 있다.
> 관리자 화면의 특성상 실수로 인한 데이터 오염 방지(안전성)와
> 원자적 저장(PUT 1회)을 통한 API 효율성(성능)이 모두 다이얼로그 방식에서 우수하다.

---

## 5-3. UI 설계 방향

### 공통 페이지 레이아웃

```
┌─────────────────────────────────────────────────┐
│  [페이지 제목]           [+ 등록] 버튼           │
├─────────────────────────────────────────────────┤
│  AppGrid (목록 — 읽기 전용, 편집 비활성화)       │
│  ┌──┬──────────┬──────┬──────┬──────┬─────────┐ │
│  │  │ 컬럼1    │ 컬럼2│ 컬럼3│ ...  │ 수정/삭제│ │
│  └──┴──────────┴──────┴──────┴──────┴─────────┘ │
└─────────────────────────────────────────────────┘

[등록/수정 다이얼로그]  ← q-dialog (Quasar 내장)
┌─────────────────────────────┐
│  사용자 등록 (또는 수정)     │
│  ─────────────────────────  │
│  사용자 ID: [________]       │  ← 등록 시만 (수정 불가)
│  사용자명:  [________]       │
│  이메일:    [________]       │
│  비밀번호:  [________]       │  ← 등록 시만 (type=password)
│                              │
│  [취소]          [저장]      │  ← 저장 시 PUT/POST 1회
└─────────────────────────────┘

[삭제 확인 다이얼로그]
┌─────────────────────────────┐
│  삭제 확인                   │
│  "홍길동" 사용자를 삭제할까요? │
│  [취소]          [삭제]      │
└─────────────────────────────┘
```

### 사용자관리 그리드 컬럼

| 컬럼     | 필드       | 너비  |
| -------- | ---------- | ----- |
| ID       | `id`       | 80px  |
| 사용자ID | `userId`   | 120px |
| 사용자명 | `userName` | flex  |
| 이메일   | `email`    | flex  |
| 역할     | `role`     | 100px |
| 관리     | (버튼)     | 100px |

### 메뉴관리 그리드 컬럼

| 컬럼      | 필드           | 너비  |
| --------- | -------------- | ----- |
| ID        | `id`           | 70px  |
| 메뉴 코드 | `menuCode`     | 150px |
| 메뉴명    | `menuName`     | flex  |
| URL       | `menuUrl`      | flex  |
| 순서      | `menuOrder`    | 80px  |
| 활성화    | `isActive`     | 80px  |
| 허용 역할 | `allowedRoles` | 150px |
| 관리      | (버튼)         | 100px |

---

## 6. 구현 순서

| 순서 | 작업                           | 파일                                     |
| :--: | ------------------------------ | ---------------------------------------- |
|  1   | 타입 정의 추가                 | `src/types/index.ts`                     |
|  2   | 사용자 스토어 구현             | `src/features/system/user-store.ts`      |
|  3   | 메뉴 스토어 구현               | `src/features/system/menu-store.ts`      |
|  4   | 사용자관리 페이지 구현         | `src/features/system/UserManagePage.vue` |
|  5   | 메뉴관리 페이지 구현           | `src/features/system/MenuManagePage.vue` |
|  6   | menu.config.ts 컴포넌트명 교체 | `src/features/workspace/menu.config.ts`  |
|  7   | MainLayout componentMap 추가   | `src/features/workspace/MainLayout.vue`  |

---

## 7. 검증 기준

| 항목             | 기준                                           |
| ---------------- | ---------------------------------------------- |
| 타입 체크        | `vue-tsc --noEmit` 오류 없음                   |
| ESLint           | `npm run lint` 오류 없음                       |
| 사용자 목록 조회 | 시스템관리 > 사용자관리 클릭 시 목록 표시      |
| 사용자 등록      | 등록 다이얼로그 → 저장 → 목록에 반영           |
| 사용자 수정      | 행 수정 버튼 → 다이얼로그 → 저장 → 반영        |
| 사용자 삭제      | 행 삭제 버튼 → 확인 → 목록에서 제거            |
| 메뉴 목록 조회   | 시스템관리 > 메뉴관리 클릭 시 목록 표시        |
| 메뉴 CRUD        | 등록/수정/삭제 동일하게 동작                   |
| JWT 인증         | 인증 없이 접근 시 401 처리 (로그인 리다이렉트) |

---

## 8. 참고 사항

- 백엔드 baseURL: 환경변수 `VITE_API_BASE_URL` (기본값 `http://localhost:8080`)
- JWT 인터셉터: `src/boot/axios.ts`에서 자동 처리
- 기존 컴포넌트 재사용: `AppGrid.vue`, `useGrid.ts` (ag-grid 기능)
- 기존 `시스템관리` 메뉴 항목 `user-mgmt`, `menu-mgmt`는 menu.config.ts에 이미 존재
