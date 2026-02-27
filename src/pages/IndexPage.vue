<template>
  <!--
    q-page: Quasar의 페이지 컴포넌트. MainLayout의 q-page-container 안에서 렌더링된다.
    class="row items-center justify-evenly": Flexbox로 콘텐츠를 수직/수평 중앙 정렬한다.
  -->
  <q-page class="row items-center justify-evenly">
    <!--
      ExampleComponent에 데이터를 props로 전달하는 예시.
      - title: 컴포넌트 제목 (정적 문자열)
      - active: 활성화 여부 플래그 (true로 고정)
      - :todos="todos": 반응형 변수(ref)를 바인딩
      - :meta="meta": 메타 정보 바인딩
    -->
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    ></example-component>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';

/**
 * ExampleComponent에 전달할 할 일 목록 반응형 상태.
 *
 * ref<Todo[]>()로 타입을 명시하여 TypeScript의 타입 안전성을 확보한다.
 * 이 변수가 변경되면 Vue가 자동으로 템플릿을 재렌더링한다.
 *
 * 실제 프로젝트에서는 API 호출 결과로 채워지는 것이 일반적이다.
 * 예) onMounted(() => { todos.value = await fetchTodos(); })
 */
const todos = ref<Todo[]>([
  { id: 1, content: 'ct1' },
  { id: 2, content: 'ct2' },
  { id: 3, content: 'ct3' },
  { id: 4, content: 'ct4' },
  { id: 5, content: 'ct5' },
]);

/**
 * 페이지네이션 등에 사용되는 메타 정보 반응형 상태.
 *
 * totalCount: 실제 서버의 전체 데이터 건수.
 * 현재는 하드코딩된 값이지만, API 응답의 pagination 정보로 대체된다.
 */
const meta = ref<Meta>({
  totalCount: 1200,
});
</script>
