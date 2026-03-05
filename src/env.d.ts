// 모듈 augmentation이 올바르게 동작하려면 파일이 module이어야 한다
export {};

// 프로세스 환경 변수 전역 타입 확장
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
      VUE_ROUTER_BASE: string | undefined;
    }
  }
}

// Vue Router meta 필드 타입 확장 — route.meta.requiresAuth 등이 타입 추론되도록 선언
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresGuest?: boolean;
  }
}
