<script setup>
import { onMounted, ref } from 'vue';
import { request } from '../api.js';
import ShopArt from '../components/ShopArt.vue';

const categories = ref([]);
const loading = ref(false);
const error = ref('');

async function loadCategories() {
  loading.value = true;
  error.value = '';
  try {
    categories.value = (await request('/categories')).data;
  } catch (failure) {
    error.value = failure.message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadCategories);
</script>

<template>
  <section class="hero" aria-labelledby="home-heading">
    <div class="hero-copy">
      <h1 id="home-heading">辦公室小物電商</h1>
      <p>從桌面、居家到隨身小物。依分類找商品，選好款式後放進購物車。</p>
      <RouterLink to="/products" class="button primary">逛所有商品 <span aria-hidden="true">→</span></RouterLink>
    </div>
    <ShopArt kind="hero" />
  </section>

  <section class="home-categories" aria-labelledby="home-categories-heading">
    <h2 id="home-categories-heading">依分類逛逛</h2>
    <p v-if="loading" role="status" class="muted">正在載入分類…</p>
    <div v-else-if="error" class="message">
      <p role="alert">{{ error }}</p>
      <button type="button" class="button secondary" @click="loadCategories">重新載入分類</button>
    </div>
    <div v-else class="category-grid">
      <RouterLink v-for="category in categories" :key="category.id" class="category-link" :to="{ name: 'products', query: { category: category.id } }">
        <ShopArt :kind="category.slug" />
        <span>{{ category.name }} <span aria-hidden="true">↗</span></span>
      </RouterLink>
    </div>
  </section>
</template>
