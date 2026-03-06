import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { UserDto, UserCreateDto, UserUpdateDto } from 'src/types';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserDto[]>([]);
  const loading = ref(false);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    try {
      const res = await api.get<UserDto[]>('/api/users');
      users.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: UserCreateDto): Promise<void> {
    await api.post<UserDto>('/api/users', payload);
    await fetchAll();
  }

  async function update(id: number, payload: UserUpdateDto): Promise<void> {
    await api.put<UserDto>(`/api/users/${id}`, payload);
    await fetchAll();
  }

  async function remove(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
  }

  return { users, loading, fetchAll, create, update, remove };
});
