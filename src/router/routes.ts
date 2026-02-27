import type { RouteRecordRaw } from 'vue-router';

/**
 * 애플리케이션의 전체 라우트(페이지 경로) 설정 배열.
 *
 * Vue Router는 이 배열을 순서대로 검사하여 현재 URL과 일치하는 첫 번째 라우트를 렌더링한다.
 *
 * 현재 라우트 구조:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  /login  →  LoginPage  (인증 불필요, 로그인 상태면 /로 리다이렉트)  │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  /       →  MainLayout  (인증 필요 - requiresAuth: true)            │
 * │             MainLayout이 탭 방식으로 콘텐츠를 직접 관리             │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  /:catchAll(.*)*  →  ErrorNotFound (404 처리)                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * meta 필드 규칙:
 * - requiresAuth: true  → 로그인 필수. 비로그인 시 /login으로 리다이렉트 (router/index.ts 참고)
 * - requiresGuest: true → 비로그인 전용. 로그인 상태면 /로 리다이렉트
 */
const routes: RouteRecordRaw[] = [
  {
    // 로그인 페이지: 레이아웃 없이 단독 페이지로 렌더링
    // requiresGuest: 이미 로그인된 사용자가 접근하면 네비게이션 가드가 /로 리다이렉트
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    // 메인 레이아웃이 감싸는 인증 필요 영역
    // requiresAuth: 비로그인 상태로 접근하면 네비게이션 가드가 /login으로 리다이렉트
    // children 없음: MainLayout이 탭 방식으로 콘텐츠를 직접 관리
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
  },

  // 위에 정의된 어떤 경로에도 해당하지 않는 경우 404 페이지로 이동.
  // 반드시 배열의 마지막에 위치해야 한다.
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
