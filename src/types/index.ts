/**
 * 프로젝트 공통 TypeScript 타입 정의.
 *
 * 특정 도메인에 속하지 않는 전역 타입을 여기에 정의한다.
 * 도메인별 타입은 각 features/{domain}/ 디렉토리에 함께 둔다.
 */

/**
 * Vue Router 라우트 meta 필드 타입 정의.
 *
 * router/routes.ts 의 meta 필드에 사용되며, 네비게이션 가드(router/index.ts)에서 참조한다.
 *
 * @property requiresAuth  - true이면 로그인 필수. 미인증 접근 시 /login으로 리다이렉트.
 * @property requiresGuest - true이면 비로그인 전용. 인증 상태로 접근 시 /으로 리다이렉트.
 */
export interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
}

/**
 * 페이지네이션이 있는 API 응답의 메타 정보.
 *
 * @property totalCount - 전체 데이터 건수
 * @property page       - 현재 페이지 번호 (1부터 시작)
 * @property pageSize   - 페이지당 항목 수
 */
export interface PaginationMeta {
  totalCount: number;
  page?: number;
  pageSize?: number;
}

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
