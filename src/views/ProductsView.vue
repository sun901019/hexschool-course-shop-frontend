<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from '../api.js';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const items = ref([]);
const categories = ref([]);
const categoryError = ref('');
const loading = ref(true);
const error = ref('');
const meta = ref({ page: 1, total: 0, totalPages: 0 });
const q = ref('');
const category = ref('');
const actualPage = computed(() => /^\d+$/.test(route.query.page || '') ? Number(route.query.page) : 1);
let active;

async function loadCategories() {
  categoryError.value = '';
  try {
    categories.value = (await request('/categories')).data;
  } catch (failure) {
    categoryError.value = failure.message;
  }
}

async function loadProducts() {
  active?.abort();
  const controller = new AbortController();
  active = controller;
  loading.value = true;
  error.value = '';
  const params = new URLSearchParams({ limit: '4', page: String(actualPage.value) });
  if (q.value.trim()) params.set('q', q.value.trim());
  if (category.value) params.set('category', category.value);
  try {
    const result = await request('/products?' + params.toString(), { signal: controller.signal });
    if (active !== controller) return;
    items.value = result.data;
    meta.value = result.meta;
  } catch (failure) {
    if (!controller.signal.aborted) error.value = failure.message;
  } finally {
    if (active === controller) loading.value = false;
  }
}

function changeQuery(page, keyword, selectedCategory) {
  const query = {};
  if (keyword) query.q = keyword;
  if (selectedCategory) query.category = selectedCategory;
  if (page > 1) query.page = String(page);
  router.push({ name: 'products', query });
}

watch(() => route.fullPath, () => {
  q.value = typeof route.query.q === 'string' ? route.query.q : '';
  category.value = typeof route.query.category === 'string' ? route.query.category : '';
  loadProducts();
}, { immediate: true });
onMounted(loadCategories);
onBeforeUnmount(() => active?.abort());
</script>

<template>
  <header class="page-heading">
    <h1>所有商品</h1>
  </header>

  <form class="filters" @submit.prevent="changeQuery(1, q.trim(), category)">
    <label>
      分類
      <select v-model="category" name="category" @change="changeQuery(1, q.trim(), category)">
        <option value="">全部分類</option>
        <option v-for="entry in categories" :key="entry.id" :value="entry.id">{{ entry.name }}</option>
      </select>
    </label>
    <label>
      搜尋商品
      <input v-model="q" name="q" type="search" placeholder="例如：筆記本" maxlength="80">
    </label>
    <div class="filter-actions">
      <button type="submit" class="button primary">搜尋</button>
      <button v-if="route.query.category || route.query.q" type="button" class="button secondary" @click="changeQuery(1, '', '')">清除</button>
    </div>
  </form>
  <div v-if="categoryError" class="notice compact" role="status">
    {{ categoryError }}
    <button type="button" class="plain-link" @click="loadCategories">重新載入分類</button>
  </div>

  <section aria-labelledby="catalog-results" :aria-busy="loading">
    <h2 id="catalog-results" class="sr-only">搜尋結果</h2>
    <p v-if="loading" role="status" class="message">正在載入商品…</p>
    <div v-else-if="error" class="message">
      <p role="alert">{{ error }}</p>
      <button type="button" class="button secondary" @click="loadProducts">重新載入商品</button>
    </div>
    <div v-else-if="!items.length" class="message">
      <h3>找不到符合的商品</h3>
      <p>換個關鍵字或清除篩選後再試。</p>
      <button type="button" class="button secondary" @click="changeQuery(1, '', '')">看所有商品</button>
    </div>
    <template v-else>
      <p class="result-summary" role="status">共 {{ meta.total }} 件商品</p>
      <div class="product-grid">
        <ProductCard v-for="item in items" :key="item.id" :product="item" />
      </div>
      <nav v-if="meta.totalPages > 1" class="pagination" aria-label="商品分頁">
        <button type="button" class="button secondary" :disabled="meta.page <= 1" @click="changeQuery(meta.page - 1, route.query.q, route.query.category)">上一頁</button>
        <span aria-current="page">第 {{ meta.page }} / {{ meta.totalPages }} 頁</span>
        <button type="button" class="button secondary" :disabled="meta.page >= meta.totalPages" @click="changeQuery(meta.page + 1, route.query.q, route.query.category)">下一頁</button>
      </nav>
    </template>
  </section>
</template>
