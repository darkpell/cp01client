<template>
  <!--
    앱의 최상위 컴포넌트(Root Component).
    router-view: 현재 URL에 해당하는 페이지 컴포넌트를 여기에 렌더링한다.
    실제 레이아웃과 페이지 구성은 src/router/routes.ts에서 정의한 컴포넌트들이 담당한다.
  -->
  <router-view />
</template>

<script setup lang="ts">
// 전역 설정이 필요한 경우 이 곳에 작성한다.
// 예) useQuasar()로 다크 모드 감지, i18n 초기화, 전역 에러 핸들러 등록 등
</script>
