import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TabItem {
  name: string;
  label: string;
  icon?: string;
  component: string;
  props?: Record<string, unknown>;
}

const HOME_TAB: TabItem = {
  name: 'home',
  label: '홈',
  icon: 'home',
  component: 'IndexPage',
};

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<TabItem[]>([HOME_TAB]);
  const activeTab = ref<string>('home');

  function openTab(tab: TabItem) {
    const existing = tabs.value.find((t) => t.name === tab.name);
    if (existing) {
      activeTab.value = tab.name;
      return;
    }
    tabs.value.push(tab);
    activeTab.value = tab.name;
  }

  function closeTab(name: string) {
    if (name === 'home') return;
    const index = tabs.value.findIndex((t) => t.name === name);
    if (index === -1) return;

    if (activeTab.value === name) {
      // 인접 탭으로 포커스 이동: 오른쪽 → 왼쪽 순
      const nextTab = tabs.value[index + 1] ?? tabs.value[index - 1];
      if (nextTab) activeTab.value = nextTab.name;
    }

    tabs.value.splice(index, 1);
  }

  return { tabs, activeTab, openTab, closeTab };
});
