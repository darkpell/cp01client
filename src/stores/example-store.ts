import { defineStore, acceptHMRUpdate } from 'pinia';

/**
 * 카운터 예제 스토어. Pinia Options Store 방식으로 작성되었다.
 *
 * Pinia는 Vue 3의 공식 상태 관리 라이브러리다.
 * Options Store(아래 방식) vs Setup Store(Composition API 방식) 중 선택하여 사용할 수 있다.
 *
 * 실제 프로젝트에서는 이 파일을 참고하여 도메인별 스토어를 추가한다.
 * 예) src/stores/auth-store.ts: 로그인 상태, JWT 토큰, 사용자 정보 관리
 *     src/stores/user-store.ts: 사용자 목록, CRUD 상태 관리
 */
export const useCounterStore = defineStore('counter', {
  /**
   * 스토어의 반응형 상태를 정의하는 함수.
   * Vuex의 state에 해당하며, 함수 형태여야 각 컴포넌트 인스턴스에서 독립적인 상태를 갖는다.
   */
  state: () => ({
    /** 현재 카운트 값. 초기값 0. */
    counter: 0,
  }),

  /**
   * 상태를 기반으로 파생된 값을 계산하는 Getter.
   * Vue computed와 동일하게 캐싱되어 의존 상태가 변경될 때만 재계산된다.
   */
  getters: {
    /**
     * counter의 2배 값을 반환한다.
     * 사용 예) const store = useCounterStore(); store.doubleCount
     */
    doubleCount: (state) => state.counter * 2,
  },

  /**
   * 상태를 변경하거나 비동기 작업을 수행하는 Actions.
   * Vuex의 mutations + actions를 하나로 합친 개념으로, async/await도 지원한다.
   */
  actions: {
    /**
     * counter를 1 증가시킨다.
     * 사용 예) const store = useCounterStore(); store.increment()
     */
    increment() {
      this.counter++;
    },
  },
});

/**
 * Vite HMR(Hot Module Replacement) 지원.
 *
 * 개발 서버에서 이 파일을 수정할 때 스토어 상태를 유지하면서 모듈만 교체한다.
 * 이 코드가 없으면 파일 저장 시 스토어 상태가 초기화된다.
 * 프로덕션 빌드에서는 import.meta.hot이 undefined이므로 실행되지 않는다.
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot));
}
