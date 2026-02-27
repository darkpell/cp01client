<template>
  <q-layout view="hHh lpR fFf" @click="closeSubMenu">
    <!-- ── 상단 헤더 ── -->
    <q-header elevated>
      <q-toolbar>
        <q-icon name="apps" size="28px" class="q-mr-sm" />
        <q-toolbar-title shrink class="q-mr-lg">CP01 시스템</q-toolbar-title>

        <!-- 상위 메뉴 버튼들 -->
        <q-btn
          v-for="menu in menuConfig"
          :key="menu.id"
          flat
          :label="menu.label"
          :class="activeMenu === menu.id ? 'bg-blue-8' : ''"
          class="q-mr-xs"
          @click.stop="toggleMenu(menu.id)"
        />

        <q-space />

        <span class="text-body2 q-mr-md">{{ authStore.userId }}</span>
        <q-btn flat dense icon="logout" label="로그아웃" @click="handleLogout" />
      </q-toolbar>

      <!-- 하위 메뉴 슬라이드 바 -->
      <transition name="submenu">
        <div v-if="activeMenu" class="submenu-bar" @click.stop>
          <q-toolbar dense class="bg-blue-8">
            <template v-for="menu in menuConfig" :key="menu.id">
              <template v-if="activeMenu === menu.id">
                <q-btn
                  v-for="item in menu.children"
                  :key="item.name"
                  flat
                  dense
                  :label="item.label"
                  class="q-mr-xs"
                  @click="openSubMenuTab(item)"
                />
              </template>
            </template>
          </q-toolbar>
        </div>
      </transition>
    </q-header>

    <!-- ── 콘텐츠 영역 ── -->
    <q-page-container>
      <q-page class="column no-wrap">
        <!-- 탭 목록 -->
        <q-tabs
          v-model="tabStore.activeTab"
          align="left"
          dense
          class="bg-grey-2 text-grey-8"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
        >
          <q-tab
            v-for="tab in tabStore.tabs"
            :key="tab.name"
            :name="tab.name"
            :icon="tab.icon"
            :label="tab.label"
          >
            <q-btn
              v-if="tab.name !== 'home'"
              flat
              dense
              round
              size="xs"
              icon="close"
              class="q-ml-xs"
              @click.stop="tabStore.closeTab(tab.name)"
            />
          </q-tab>
        </q-tabs>

        <q-separator />

        <!-- 탭 콘텐츠 (v-show로 상태 유지) -->
        <div class="col relative-position">
          <div
            v-for="tab in tabStore.tabs"
            :key="tab.name"
            v-show="tabStore.activeTab === tab.name"
            class="absolute-full overflow-auto"
          >
            <component :is="componentMap[tab.component]" v-bind="tab.props" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import { useTabStore, type TabItem } from 'stores/tab-store';
import IndexPage from 'pages/IndexPage.vue';
import SamplePage from 'pages/SamplePage.vue';

const router = useRouter();
const authStore = useAuthStore();
const tabStore = useTabStore();

// ── 컴포넌트 맵 ──
const componentMap: Record<string, Component> = {
  IndexPage,
  SamplePage,
};

// ── 메뉴 설정 ──
interface SubMenuItem {
  name: string;
  label: string;
  component: string;
  props?: Record<string, unknown>;
}
interface MenuConfig {
  id: string;
  label: string;
  children: SubMenuItem[];
}

const menuConfig: MenuConfig[] = [
  {
    id: 'business',
    label: '업무관리',
    children: [
      { name: 'work-status', label: '업무현황', component: 'SamplePage', props: { pageTitle: '업무현황' } },
      { name: 'work-register', label: '업무등록', component: 'SamplePage', props: { pageTitle: '업무등록' } },
    ],
  },
  {
    id: 'system',
    label: '시스템관리',
    children: [
      { name: 'user-mgmt', label: '사용자관리', component: 'SamplePage', props: { pageTitle: '사용자관리' } },
      { name: 'menu-mgmt', label: '메뉴관리', component: 'SamplePage', props: { pageTitle: '메뉴관리' } },
    ],
  },
];

// ── 하위 메뉴 토글 ──
const activeMenu = ref<string | null>(null);

function toggleMenu(menuId: string) {
  activeMenu.value = activeMenu.value === menuId ? null : menuId;
}

function closeSubMenu() {
  activeMenu.value = null;
}

function openSubMenuTab(item: SubMenuItem) {
  const tab: TabItem = {
    name: item.name,
    label: item.label,
    component: item.component,
    ...(item.props !== undefined && { props: item.props }),
  };
  tabStore.openTab(tab);
  activeMenu.value = null;
}

// ── 로그아웃 ──
function handleLogout() {
  authStore.logout();
  void router.push('/login');
}
</script>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
.submenu-enter-to,
.submenu-leave-from {
  max-height: 48px;
  opacity: 1;
}
</style>
