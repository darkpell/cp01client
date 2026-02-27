import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';

/**
 * Pinia 커스텀 속성 타입 확장 선언.
 *
 * Pinia 플러그인을 통해 모든 스토어에 공통 속성을 추가할 경우
 * 이 인터페이스에 타입을 추가하면 TypeScript에서 자동 완성이 지원된다.
 *
 * 예) Pinia 플러그인에서 store.$myPlugin = ... 을 추가한다면:
 *   export interface PiniaCustomProperties {
 *     $myPlugin: MyPluginType;
 *   }
 *
 * 현재는 사용하지 않으므로 빈 인터페이스.
 */
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // 커스텀 속성이 필요한 경우 여기에 추가한다
  }
}

/**
 * Quasar의 defineStore()로 Pinia 인스턴스를 생성하는 팩토리 함수.
 *
 * defineStore()로 감싸면 Quasar가 SSR/SPA에 따라 적절한 타이밍에 Pinia를 초기화한다.
 * 내부 함수는 async도 지원하므로, 스토어 초기화 전 비동기 작업도 가능하다.
 *
 * SSR 주의사항: SSR에서는 요청마다 새 Pinia 인스턴스가 필요하다.
 * 이 함수가 각 요청(클라이언트)별로 독립 실행되므로 상태 공유 문제를 방지한다.
 * (SPA에서는 앱 전체에서 단일 인스턴스를 공유)
 */
export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();

  // Pinia 플러그인 추가 위치.
  // 예) pinia.use(piniaPluginPersistedstate) : 스토어 상태를 localStorage에 자동 저장
  // pinia.use(SomePiniaPlugin)

  return pinia;
});
