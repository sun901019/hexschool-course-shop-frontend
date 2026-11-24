<script setup>
import { formatPrice } from '../api.js';
import ShopArt from './ShopArt.vue';
defineProps({ product: { type: Object, required: true } });
</script>

<template>
  <article class="product-card">
    <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="product-link">
      <ShopArt :kind="product.category?.slug" />
      <div class="product-card-content">
        <p class="muted small">{{ product.category?.name }}</p>
        <h2>{{ product.name }}</h2>
        <p class="card-price">
          <span v-if="product.price !== null">{{ formatPrice(product.price) }}</span>
          <span v-if="!product.available" class="small muted">目前缺貨</span>
        </p>
      </div>
    </RouterLink>
  </article>
</template>
