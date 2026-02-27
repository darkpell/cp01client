<template>
  <!--
    Quasar의 q-layout 컴포넌트: 전체 페이지 레이아웃 골격을 정의한다.
    view="lHh Lpr lFf": 헤더/풋터/드로어의 고정 방식을 지정하는 레이아웃 문자열.
      - lHh: left drawer는 헤더 위에 표시
      - Lpr: 상단 헤더(L), 페이지 콘텐츠(p), 오른쪽 드로어(r)
      - lFf: left drawer는 풋터 아래에 표시
  -->
  <q-layout view="lHh Lpr lFf">

    <!--
      상단 헤더 영역. elevated 속성으로 그림자 효과를 준다.
    -->
    <q-header elevated>
      <q-toolbar>
        <!-- 햄버거 메뉴 버튼: 클릭 시 왼쪽 드로어(사이드바)를 열고 닫는다 -->
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <!-- 앱 제목 표시 영역 (flex: 1로 남은 공간을 채움) -->
        <q-toolbar-title> Quasar App </q-toolbar-title>

        <!-- Quasar 버전 표시 ($q.version: Quasar 전역 객체에서 버전 정보 제공) -->
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <!--
      왼쪽 사이드 드로어(서랍) 영역.
      v-model="leftDrawerOpen": 반응형 변수로 열림/닫힘 상태를 제어한다.
      show-if-above: 화면이 일정 크기(md) 이상이면 드로어를 항상 표시한다 (반응형 레이아웃).
      bordered: 드로어 오른쪽에 경계선을 표시한다.
    -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <!--
          linksList 배열을 순회하며 EssentialLink 컴포넌트를 렌더링한다.
          v-bind="link": link 객체의 모든 속성을 EssentialLink의 props로 한 번에 전달한다.
        -->
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <!--
      페이지 콘텐츠 영역. <router-view>가 현재 라우트에 맞는 페이지 컴포넌트를 렌더링한다.
    -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

/**
 * 사이드 드로어에 표시할 외부 링크 목록.
 * 각 항목은 EssentialLink 컴포넌트의 props에 해당하는 EssentialLinkProps 타입을 따른다.
 */
const linksList: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

/**
 * 왼쪽 드로어(사이드바)의 열림/닫힘 상태를 관리하는 반응형 변수.
 * 초기값 false: 앱 시작 시 드로어는 닫혀 있다.
 * (show-if-above 속성에 의해 화면이 넓으면 자동으로 열릴 수 있다)
 */
const leftDrawerOpen = ref(false);

/**
 * 드로어 열림/닫힘 상태를 토글한다.
 * 헤더의 햄버거 메뉴 버튼 클릭 이벤트에 바인딩된다.
 */
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
