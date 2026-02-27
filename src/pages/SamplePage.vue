<template>
  <div class="column items-center justify-center q-pa-xl" style="min-height: 300px">
    <q-icon name="construction" size="64px" color="grey-5" />
    <div class="text-h5 text-grey-7 q-mt-md">{{ pageTitle }}</div>
    <div class="text-body2 text-grey-5 q-mt-sm">해당 페이지는 개발 예정입니다.</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pageTitle: string;
}>();
</script>
