import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

/**
 * Vue 컴포넌트 Options API에서 this.$axios, this.$api 접근을 가능하게 하는 타입 선언.
 *
 * Composition API(script setup)에서는 직접 import해서 사용하는 것이 권장된다.
 * 예) import { api } from 'boot/axios'
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance; // 기본 Axios 인스턴스 (baseURL 없음)
    $api: AxiosInstance;   // 서버 API 전용 인스턴스 (baseURL 설정됨)
  }
}

/**
 * 서버 API 요청에 사용할 Axios 인스턴스.
 *
 * baseURL이 설정되어 있어 각 API 호출 시 경로만 지정하면 된다.
 * 예) api.get('/api/users') → 실제 요청: http://localhost:8080/api/users
 *
 * 주의(SSR 환경): 이 인스턴스는 모듈 레벨에서 싱글턴으로 생성된다.
 * SSR에서는 여러 클라이언트가 동일 인스턴스를 공유할 수 있어 상태 오염(cross-request pollution)이
 * 발생할 수 있다. SSR을 사용한다면 아래 export default 함수 내부에서 인스턴스를 생성할 것.
 */
const api = axios.create({
  // 개발: Vite 프록시(quasar.config.ts devServer.proxy)가 요청을 백엔드로 중계
  // 운영: 배포 시 실제 백엔드 URL로 변경 필요
  baseURL: '',
  timeout: 10000, // 10초 타임아웃
});

/**
 * 요청 인터셉터: 모든 API 요청에 JWT 토큰을 Authorization 헤더로 자동 첨부한다.
 *
 * auth-store의 순환 참조를 피하기 위해 localStorage에서 직접 토큰을 읽는다.
 * 로그인되어 있으면 → Authorization: Bearer <token>
 * 비로그인이면     → Authorization 헤더 없음 (/auth/** 엔드포인트는 토큰 없이 허용)
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Quasar 부트 파일: 앱 초기화 시 Axios 인스턴스를 Vue 전역 속성으로 등록한다.
 *
 * defineBoot()로 감싸면 Quasar가 앱 마운트 전에 이 함수를 실행하여
 * 전역 설정을 완료한 뒤 Vue 앱을 시작한다.
 *
 * 등록 후 사용 방법:
 * - Options API : this.$api.get(...)
 * - Composition API: import { api } from 'boot/axios' 후 api.get(...)
 */
export default defineBoot(({ app }) => {
  // Vue 전역 속성에 기본 Axios 인스턴스 등록 (절대 경로 요청 시 사용)
  app.config.globalProperties.$axios = axios;

  // Vue 전역 속성에 API 전용 Axios 인스턴스 등록 (상대 경로 요청 시 사용)
  app.config.globalProperties.$api = api;
});

// Composition API나 다른 모듈에서 직접 import해서 사용할 수 있도록 named export
export { api };
