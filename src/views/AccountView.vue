<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from '../api.js';
import { useSession } from '../stores/session.js';

const route = useRoute();
const router = useRouter();
const auth = useSession();
const isRegistrationPage = computed(() => route.name === 'register');
const name = ref('');
const email = ref('');
const password = ref('');
const busy = ref(false);
const error = ref('');

watch(() => route.name, () => {
  name.value = '';
  password.value = '';
  error.value = '';
});

function getReturnPath() {
  const next = route.query.next;
  if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
    const destination = router.resolve(next);
    if (['products', 'product', 'cart'].includes(destination.name)) return destination.fullPath;
  }
  return '/products';
}

async function submitAccountForm() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    if (isRegistrationPage.value) {
      await request('/auth/register', { method: 'POST', body: { name: name.value, email: email.value, password: password.value } });
      await router.push({ name: 'login', query: { registered: '1', next: route.query.next } });
    } else {
      await auth.signIn(email.value, password.value);
      await router.replace(getReturnPath());
    }
  } catch (failure) {
    error.value = failure.message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="account-card">
    <h1>{{ isRegistrationPage ? '註冊會員' : '會員登入' }}</h1>
    <p v-if="!isRegistrationPage && route.query.registered === '1'" role="status" class="notice">註冊完成，可以使用剛建立的帳號登入。</p>
    <p v-if="auth.user" class="muted">目前已登入為 {{ auth.user.name }}。</p>
    <form v-else class="account-form" @submit.prevent="submitAccountForm">
      <label v-if="isRegistrationPage">
        姓名
        <input v-model="name" name="name" autocomplete="name" maxlength="60" required>
      </label>
      <label>
        Email
        <input v-model="email" name="email" type="email" autocomplete="email" maxlength="254" required>
      </label>
      <label>
        密碼
        <input v-model="password" name="password" type="password" :autocomplete="isRegistrationPage ? 'new-password' : 'current-password'" :minlength="isRegistrationPage ? 8 : 1" maxlength="72" required>
      </label>
      <p v-if="isRegistrationPage" class="muted small">請使用課程測試信箱。密碼需 8 至 72 個字元。</p>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <button type="submit" class="button primary" :disabled="busy || auth.status === 'loading'">
        {{ busy ? '處理中…' : (isRegistrationPage ? '註冊' : '登入') }}
      </button>
    </form>
    <p v-if="!auth.user" class="account-alternate">
      <RouterLink :to="{ name: isRegistrationPage ? 'login' : 'register', query: { next: route.query.next } }" class="plain-link">
        {{ isRegistrationPage ? '已有帳號，前往登入' : '第一次來？註冊會員' }}
      </RouterLink>
    </p>
  </section>
</template>
