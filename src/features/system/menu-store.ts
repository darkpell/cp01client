import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { MenuDto, MenuCreateDto, MenuUpdateDto } from 'src/types';

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<MenuDto[]>([]);
  const loading = ref(false);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    try {
      const res = await api.get<MenuDto[]>('/api/menus');
      menus.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: MenuCreateDto): Promise<void> {
    await api.post<MenuDto>('/api/menus', payload);
    await fetchAll();
  }

  async function update(id: number, payload: MenuUpdateDto): Promise<void> {
    await api.put<MenuDto>(`/api/menus/${id}`, payload);
    await fetchAll();
  }

  async function remove(id: number): Promise<void> {
    await api.delete(`/api/menus/${id}`);
    menus.value = menus.value.filter((m) => m.id !== id);
  }

  return { menus, loading, fetchAll, create, update, remove };
});
