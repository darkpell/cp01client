<template>
  <div>
    <!-- 컴포넌트 제목 표시 -->
    <p>{{ title }}</p>

    <!--
      할 일 목록 렌더링.
      :key="todo.id" : Vue가 각 항목을 고유하게 추적하여 DOM 재사용을 최적화한다.
      @click="increment" : 항목 클릭 시 클릭 횟수를 1 증가시킨다.
    -->
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>

    <!-- 현재 목록 건수 / 전체 건수 표시 (페이지네이션 상태 표현) -->
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>

    <!-- active prop에 따라 활성화 여부를 텍스트로 표시 -->
    <p>Active: {{ active ? 'yes' : 'no' }}</p>

    <!-- 할 일 항목 클릭 횟수 누적 표시 -->
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Todo, Meta } from './models';

/**
 * ExampleComponent의 Props 타입 정의.
 *
 * @property title  - 컴포넌트 상단에 표시되는 제목 (필수).
 * @property todos  - 렌더링할 할 일 목록 (선택, 기본값: 빈 배열).
 * @property meta   - 페이지네이션 등에 사용되는 메타 정보 (필수).
 * @property active - 컴포넌트의 활성화 여부 플래그 (필수).
 */
interface Props {
  title: string;
  todos?: Todo[];
  meta: Meta;
  active: boolean;
}

// todos prop이 전달되지 않으면 빈 배열을 기본값으로 사용.
// 함수 형태(() => [])로 지정하여 배열 참조 공유 문제를 방지한다.
const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
});

/**
 * 할 일 항목 클릭 횟수를 추적하는 반응형 상태.
 * ref()로 감싸 Vue가 값 변경을 감지하고 템플릿을 자동으로 재렌더링한다.
 */
const clickCount = ref(0);

/**
 * 클릭 횟수를 1 증가시키고 현재 횟수를 반환하는 핸들러.
 * 템플릿의 각 li 항목 클릭 이벤트({@code @click})에 바인딩된다.
 */
function increment() {
  clickCount.value += 1;
  return clickCount.value;
}

/**
 * todos 배열의 현재 길이를 반환하는 계산 속성(Computed).
 * todos prop이 변경될 때만 재계산되므로 렌더링 성능에 유리하다.
 */
const todoCount = computed(() => props.todos.length);
</script>
