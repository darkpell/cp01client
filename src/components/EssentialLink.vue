<template>
  <!--
    외부 링크를 Quasar의 q-item 형태로 렌더링하는 컴포넌트.
    tag="a"를 지정하여 실제 <a> 엘리먼트로 렌더링되므로 SEO와 접근성에 유리하다.
    target="_blank"로 새 탭에서 링크를 연다.
  -->
  <q-item clickable tag="a" target="_blank" :href="link">
    <!-- 아이콘이 props로 전달된 경우에만 왼쪽 아바타 영역을 표시 -->
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <!-- 제목(title)과 부제목(caption)을 표시하는 콘텐츠 영역 -->
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
/**
 * EssentialLink 컴포넌트의 Props 타입 정의.
 *
 * @property title   - 링크 항목에 표시될 제목 텍스트 (필수).
 * @property caption - 제목 아래에 표시될 부제목 텍스트 (선택, 기본값: '').
 * @property link    - 클릭 시 이동할 URL (선택, 기본값: '#' 즉 현재 페이지).
 * @property icon    - Quasar Material Icons 아이콘 이름 (선택, 기본값: '' 즉 미표시).
 *                     https://fonts.google.com/icons 에서 이름 확인 가능.
 */
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

// withDefaults: 선택적 props에 기본값을 지정한다.
// props가 전달되지 않으면 아래 기본값이 사용된다.
withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',  // 부제목 없음
  link: '#',    // 이동 없음 (현재 페이지)
  icon: '',     // 아이콘 없음 (v-if="icon"에 의해 아바타 섹션 숨김)
});
</script>
