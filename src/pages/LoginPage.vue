<template>
  <!-- 전체 화면을 채우는 배경. 중앙 정렬로 로그인 카드를 배치한다. -->
  <!-- q-page는 q-layout 없이 단독 사용 불가 → div + fullscreen 클래스로 대체 -->
  <div class="fullscreen column flex-center bg-grey-2">

    <!-- 로그인 카드: 최대 너비 400px, 모바일에서는 화면 90% 너비 -->
    <q-card flat bordered style="width: 400px; max-width: 90vw;">

      <!-- 헤더: 아이콘 + 타이틀 -->
      <q-card-section class="text-center q-pt-xl q-pb-sm">
        <q-icon name="lock_person" size="60px" color="primary" />
        <div class="text-h5 q-mt-sm text-weight-bold text-grey-9">CP01 시스템</div>
        <div class="text-caption text-grey-6 q-mt-xs">사번과 비밀번호를 입력하세요</div>
      </q-card-section>

      <!-- 로그인 폼 -->
      <q-card-section class="q-px-xl q-pt-md q-pb-xl">
        <!--
          @submit.prevent: 기본 form submit(페이지 새로고침)을 막고 onSubmit 실행.
          greedy: 모든 필드의 유효성 검사를 한 번에 실행한다.
        -->
        <q-form ref="loginForm" @submit.prevent="onSubmit" greedy>

          <!-- 사번 입력 필드 -->
          <q-input
            v-model="form.userId"
            label="사번"
            outlined
            :rules="[val => !!val || '사번을 입력하세요.']"
            :disable="isLoading"
            autofocus
          >
            <template #prepend>
              <q-icon name="badge" color="grey-6" />
            </template>
          </q-input>

          <!-- 비밀번호 입력 필드 -->
          <q-input
            v-model="form.password"
            label="비밀번호"
            outlined
            class="q-mt-sm"
            :type="showPassword ? 'text' : 'password'"
            :rules="[val => !!val || '비밀번호를 입력하세요.']"
            :disable="isLoading"
            @keyup.enter="onSubmit"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <!-- 비밀번호 표시/숨기기 토글 버튼 -->
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                color="grey-6"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- 로그인 실패 에러 메시지 -->
          <q-banner
            v-if="errorMessage"
            dense
            rounded
            class="bg-red-1 text-negative q-mt-md"
            style="font-size: 0.85rem;"
          >
            <template #avatar>
              <q-icon name="error_outline" />
            </template>
            {{ errorMessage }}
          </q-banner>

          <!-- 로그인 버튼 -->
          <q-btn
            type="submit"
            color="primary"
            label="로그인"
            unelevated
            size="md"
            class="full-width q-mt-lg"
            :loading="isLoading"
          />

        </q-form>
      </q-card-section>

    </q-card>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

/** 로그인 폼 입력값 */
const form = reactive({
  userId: '',
  password: '',
});

/** 비밀번호 표시 여부 토글 상태 */
const showPassword = ref(false);

/** API 요청 중 로딩 상태. true이면 버튼과 입력 필드를 비활성화한다. */
const isLoading = ref(false);

/** 로그인 실패 시 표시할 에러 메시지. 성공 시 빈 문자열로 초기화. */
const errorMessage = ref('');

/**
 * 로그인 폼 제출 핸들러.
 *
 * 처리 흐름:
 * 1. 에러 메시지 초기화 및 로딩 상태 시작
 * 2. auth-store의 login() 호출 → 서버 POST /auth/login
 * 3. 성공: 메인 페이지('/')로 이동
 * 4. 실패: 에러 메시지 표시 (인증 실패 401, 네트워크 오류 등)
 */
async function onSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    await authStore.login(form.userId, form.password);
    // 로그인 성공 → 메인 페이지로 이동 (이전 히스토리를 replace하여 뒤로가기로 로그인 페이지로 못 돌아오게)
    await router.replace('/');
  } catch (error: unknown) {
    // axios 에러 응답 처리
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object'
    ) {
      const response = (error as { response: { status: number; data?: { error?: string } } }).response;
      if (response.status === 401) {
        errorMessage.value = '사번 또는 비밀번호가 올바르지 않습니다.';
      } else if (response.data?.error) {
        errorMessage.value = response.data.error;
      } else {
        errorMessage.value = '로그인 중 오류가 발생했습니다.';
      }
    } else {
      // 네트워크 오류 등
      errorMessage.value = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
