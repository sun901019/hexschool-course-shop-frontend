<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from './stores/session.js';
import { useCart } from './stores/cart.js';

const auth = useSession();
const cart = useCart();
const router = useRouter();
const logoutError = ref('');
const loggingOut = ref(false);

onMounted(() => auth.refresh());
watch(() => auth.user?.id, () => {
  cart.reset(auth.user?.id ?? null);
  if (auth.user?.role === 'Member') cart.loadCart();
});

async function logout() {
  loggingOut.value = true;
  logoutError.value = '';
  try {
    await auth.signOut();
    await router.push({ name: 'products' });
  } catch (error) {
    logoutError.value = error.message;
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <a class="skip-link" href="#main">跳至主要內容</a>
  <header class="header">
    <div class="layout header-inner">
      <RouterLink to="/" class="brand" aria-label="辦公室小物首頁">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>辦公室小物<span class="brand-sub">課程商店</span></span>
      </RouterLink>
      <nav class="navigation" aria-label="主要導覽">
        <RouterLink to="/products">商品</RouterLink>
        <RouterLink to="/cart">
          購物車
          <span v-if="cart.view.totals.quantity" class="count">{{ cart.view.totals.quantity }}</span>
        </RouterLink>
        <RouterLink v-if="!auth.user" to="/login">登入</RouterLink>
        <button v-else type="button" class="nav-button" :disabled="loggingOut" @click="logout">登出</button>
      </nav>
    </div>
  </header>

  <div v-if="auth.user || logoutError || auth.status === 'error'" class="layout account-line" aria-live="polite">
    <span v-if="auth.user">{{ auth.user.name }}<template v-if="auth.user.role === 'Admin'"> · 管理員</template></span>
    <span v-if="logoutError" class="error">{{ logoutError }}</span>
    <span v-if="auth.status === 'error'">
      {{ auth.error }}
      <button type="button" class="plain-link" @click="auth.refresh()">重新確認登入</button>
    </span>
  </div>

  <main id="main" class="layout main-content">
    <RouterView />
  </main>

  <footer class="footer">
    <div class="layout footer-inner">
      <span>辦公室小物電商</span>
      <span>課程示範 · 測試商品</span>
    </div>
  </footer>
</template>
