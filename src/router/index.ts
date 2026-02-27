import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/**
 * Quasar의 defineRouter()로 Vue Router 인스턴스를 생성하고 네비게이션 가드를 등록한다.
 *
 * defineRouter()로 감싸면 Quasar가 SSR/SPA에 따라 적절한 타이밍에 라우터를 초기화한다.
 *
 * 히스토리 모드 선택 기준:
 * ┌────────────────────────────┬──────────────────────────────────────────────────────┐
 * │ 환경/설정                  │ 사용되는 히스토리 모드                               │
 * ├────────────────────────────┼──────────────────────────────────────────────────────┤
 * │ SSR 서버 측                │ createMemoryHistory (서버에서 URL 파싱에 사용)       │
 * │ VUE_ROUTER_MODE=history    │ createWebHistory (HTML5 History API, 깔끔한 URL)     │
 * │ 그 외 (기본, hash 모드)    │ createWebHashHistory (URL에 # 포함, 서버 설정 불필요)│
 * └────────────────────────────┴──────────────────────────────────────────────────────┘
 */
export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  /**
   * 전역 네비게이션 가드.
   *
   * 모든 라우트 이동 전에 실행되어 인증 상태에 따라 접근을 제어한다.
   * auth-store 대신 localStorage를 직접 참조하여 Pinia 초기화 타이밍 문제를 피한다.
   *
   * 처리 규칙:
   * 1. requiresAuth 라우트 + 비로그인 → /login으로 리다이렉트
   * 2. requiresGuest 라우트 + 로그인  → /로 리다이렉트 (로그인 페이지에 다시 못 들어오게)
   * 3. 그 외                          → 이동 허용
   */
  Router.beforeEach((to) => {
    // localStorage에서 토큰 존재 여부로 로그인 상태 판단
    // (auth-store와 동일한 키 'auth_token' 사용)
    const isAuthenticated = !!localStorage.getItem('auth_token');

    // 인증이 필요한 페이지인데 비로그인 상태 → 로그인 페이지로 이동
    if (to.meta.requiresAuth && !isAuthenticated) {
      return { path: '/login' };
    }

    // 비로그인 전용 페이지(로그인 화면)인데 이미 로그인 상태 → 메인으로 이동
    if (to.meta.requiresGuest && isAuthenticated) {
      return { path: '/' };
    }
  });

  return Router;
});
