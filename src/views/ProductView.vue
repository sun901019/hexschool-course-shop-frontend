<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { money, request } from '../api.js';
import { useSession } from '../stores/session.js';
import { useCart } from '../stores/cart.js';
import ShopArt from '../components/ShopArt.vue';

const route = useRoute();
const router = useRouter();
const auth = useSession();
const cart = useCart();
const product = ref(null);
const loading = ref(true);
const error = ref('');
const success = ref('');
const addError = ref('');
const selectedId = ref('');
const quantity = ref(1);
const selected = computed(() => product.value?.variants.find(item => item.id === selectedId.value));
const quantityLimit = computed(() => Math.min(selected.value?.stock || 0, 99));
let active;
let attempt;

async function load() {
  active?.abort();
  const controller = new AbortController();
  active = controller;
  loading.value = true;
  product.value = null;
  error.value = '';
  success.value = '';
  addError.value = '';
  attempt = undefined;
  try {
    const result = await request('/products/' + encodeURIComponent(route.params.id), { signal: controller.signal });
    if (active !== controller) return;
    product.value = result.data;
    const options = product.value.variants;
    selectedId.value = (options.find(item => item.stock > 0) || options[0])?.id || '';
    quantity.value = 1;
  } catch (failure) {
    if (!controller.signal.aborted) error.value = failure.message;
  } finally {
    if (controller === active) loading.value = false;
  }
}

watch(() => route.params.id, load, { immediate: true });
watch(selectedId, () => {
  quantity.value = 1;
  success.value = '';
  addError.value = '';
});
onBeforeUnmount(() => active?.abort());

async function addProduct() {
  success.value = '';
  addError.value = '';
  if (!auth.user) {
    await router.push({ name: 'login', query: { next: route.fullPath } });
    return;
  }
  if (auth.user.role !== 'Member') {
    addError.value = '請使用一般會員試用購物車。';
    return;
  }
  const variantId = selectedId.value;
  const count = quantity.value;
  if (!Number.isInteger(count) || count < 1 || count > quantityLimit.value) {
    addError.value = '請輸入可購買的數量。';
    return;
  }
  if (attempt?.variantId !== variantId || attempt.quantity !== count) {
    attempt = { variantId, quantity: count, key: crypto.randomUUID() };
  }
  if (await cart.add(variantId, count, attempt.key)) {
    success.value = '已加入購物車。';
    attempt = undefined;
  } else {
    addError.value = cart.error || '購物車正在更新，請再試一次。';
  }
}
</script>

<template>
  <nav aria-label="頁面位置" class="breadcrumb">
    <RouterLink to="/products">所有商品</RouterLink>
    <span aria-hidden="true">/</span>
    <span>商品明細</span>
  </nav>
  <p v-if="loading" class="message" role="status">正在載入商品…</p>
  <div v-else-if="error" class="message">
    <p role="alert">{{ error }}</p>
    <button type="button" class="button secondary" @click="load">再試一次</button>
  </div>
  <article v-else-if="product" class="detail">
    <ShopArt :kind="product.category?.slug" />
    <div class="detail-copy">
      <p class="muted">{{ product.category?.name }}</p>
      <h1>{{ product.name }}</h1>
      <p v-if="selected" class="detail-price">{{ money(selected.price) }}</p>
      <p class="description">{{ product.description }}</p>
      <form class="detail-form" @submit.prevent="addProduct">
        <label>
          款式
          <select v-model="selectedId" name="variant" :disabled="cart.busy">
            <option v-for="item in product.variants" :key="item.id" :value="item.id">{{ item.label }}{{ item.stock < 1 ? '（缺貨）' : '' }}</option>
          </select>
        </label>
        <label v-if="quantityLimit > 0" class="number-label">
          數量
          <input v-model.number="quantity" name="quantity" type="number" min="1" :max="quantityLimit" :disabled="cart.busy" required>
        </label>
        <p v-else class="muted">這個款式目前缺貨。</p>
        <button type="submit" class="button primary" :disabled="quantityLimit < 1 || cart.busy || auth.status === 'loading'">
          {{ auth.user ? '加入購物車' : '登入後加入購物車' }}
        </button>
        <p v-if="addError" class="error" role="alert">{{ addError }}</p>
        <p v-if="success" class="notice compact" role="status">
          {{ success }} <RouterLink class="plain-link" to="/cart">查看購物車</RouterLink>
        </p>
      </form>
    </div>
  </article>
</template>
