import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';

/** 서버 로그인 API의 응답 구조 */
interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  role: string;
}

/**
 * 인증(Authentication) 상태를 전역으로 관리하는 Pinia 스토어.
 *
 * 관리 항목:
 * - JWT 액세스 토큰
 * - 로그인한 사용자의 사번(userId), 권한(role)
 * - 로그인/로그아웃 액션
 *
 * 토큰 지속성(Persistence):
 * localStorage에 토큰을 저장하여 브라우저를 새로고침해도 로그인 상태가 유지된다.
 * 스토어 초기화 시 localStorage에서 값을 복원한다.
 */
export const useAuthStore = defineStore('auth', () => {
  // ────────────────────────────────────────────────────────────────
  // State: localStorage에서 초기값을 복원하여 새로고침 시 로그인 유지
  // ────────────────────────────────────────────────────────────────

  /** JWT 액세스 토큰. null이면 비로그인 상태. */
  const token = ref<string | null>(localStorage.getItem('auth_token'));

  /** 로그인한 사용자의 사번(user_id). */
  const userId = ref<string | null>(localStorage.getItem('auth_userId'));

  /** 로그인한 사용자의 권한 (예: "USER", "ADMIN"). */
  const role = ref<string | null>(localStorage.getItem('auth_role'));

  // ────────────────────────────────────────────────────────────────
  // Getters
  // ────────────────────────────────────────────────────────────────

  /** 로그인 여부. 토큰이 존재하면 true. */
  const isAuthenticated = computed(() => !!token.value);

  // ────────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────────

  /**
   * 서버의 로그인 API를 호출하여 JWT 토큰을 발급받고 상태를 저장한다.
   *
   * @param loginUserId 로그인할 사번
   * @param password    비밀번호 (평문)
   * @throws 인증 실패(사번 없음, 비밀번호 불일치) 시 axios 에러 발생 → 컴포넌트에서 처리
   */
  async function login(loginUserId: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', {
      userId: loginUserId,
      password,
    });

    const data = response.data;

    // 스토어 상태 업데이트
    token.value = data.accessToken;
    userId.value = data.userId;
    role.value = data.role;

    // localStorage에 저장하여 새로고침 후에도 로그인 상태 유지
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('auth_userId', data.userId);
    localStorage.setItem('auth_role', data.role);
  }

  /**
   * 로그아웃 처리. 스토어 상태와 localStorage를 모두 초기화한다.
   *
   * 서버에는 별도 로그아웃 API가 없으므로(JWT Stateless) 클라이언트에서만 토큰을 삭제한다.
   */
  function logout() {
    token.value = null;
    userId.value = null;
    role.value = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_userId');
    localStorage.removeItem('auth_role');
  }

  return {
    // state
    token,
    userId,
    role,
    // getters
    isAuthenticated,
    // actions
    login,
    logout,
  };
});
