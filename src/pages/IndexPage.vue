<template>
  <div class="column items-center justify-center q-pa-xl" style="min-height: 400px">
    <q-icon name="waving_hand" size="64px" color="primary" />
    <div class="text-h4 q-mt-md">안녕하세요, {{ authStore.userId }}님!</div>
    <div class="text-body1 text-grey-6 q-mt-sm">오늘도 좋은 하루 되세요. ({{ today }})</div>

    <div class="row q-gutter-md q-mt-xl">
      <q-card class="col text-center" style="min-width: 160px">
        <q-card-section>
          <q-icon name="check_circle" size="36px" color="positive" />
          <div class="text-subtitle1 q-mt-sm">시스템 정상</div>
          <div class="text-caption text-grey-6">모든 서비스 운영 중</div>
        </q-card-section>
      </q-card>
      <q-card class="col text-center" style="min-width: 160px">
        <q-card-section>
          <q-icon name="security" size="36px" color="info" />
          <div class="text-subtitle1 q-mt-sm">보안 연결</div>
          <div class="text-caption text-grey-6">JWT 인증 활성</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();

const today = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
});
</script>
