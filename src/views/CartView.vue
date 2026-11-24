<script setup>
import { formatPrice } from '../api.js';
import { useSession } from '../stores/session.js';
import { useCart } from '../stores/cart.js';

const auth = useSession();
const cart = useCart();
</script>

<template>
  <header class="page-heading">
    <h1>購物車</h1>
  </header>
  <p v-if="auth.status === 'loading'" class="message" role="status">正在確認會員…</p>
  <div v-else-if="!auth.user" class="message">
    <h2>登入後查看購物車</h2>
    <RouterLink class="button primary" :to="{ name: 'login', query: { next: '/cart' } }">前往登入</RouterLink>
  </div>
  <div v-else-if="auth.user.role !== 'Member'" class="message">
    <h2>購物車供一般會員使用</h2>
    <RouterLink class="plain-link" to="/products">回所有商品</RouterLink>
  </div>
  <template v-else>
    <div v-if="cart.error" class="notice">
      <p role="alert">{{ cart.error }}</p>
      <button class="button secondary" type="button" @click="cart.loadCart()">重新讀取購物車</button>
    </div>
    <p v-if="!cart.loaded && !cart.error" class="message" role="status">正在載入購物車…</p>
    <div v-else-if="cart.loaded && !cart.view.items.length" class="message">
      <h2>購物車目前是空的</h2>
      <RouterLink class="button secondary" to="/products">繼續逛商品</RouterLink>
    </div>
    <div v-else-if="cart.view.items.length" class="cart-layout">
      <ul class="cart-items" aria-label="購物車品項">
        <li v-for="item in cart.view.items" :key="item.id" class="cart-row">
          <div class="min-w-0">
            <RouterLink class="cart-name" :to="{ name: 'product', params: { id: item.productId } }">{{ item.productName }}</RouterLink>
            <p class="small muted">{{ item.variantLabel }} · 單價 {{ formatPrice(item.unitPrice) }}</p>
          </div>
          <div class="stepper" :aria-label="item.productName + '數量'">
            <button type="button" :aria-label="'減少' + item.productName + '數量'" :disabled="cart.busy || item.quantity <= 1" @click="cart.updateItemQuantity(item.id, item.quantity - 1)">−</button>
            <span data-testid="cart-quantity">{{ item.quantity }}</span>
            <button type="button" :aria-label="'增加' + item.productName + '數量'" :disabled="cart.busy || item.quantity >= Math.min(item.stock, 99)" @click="cart.updateItemQuantity(item.id, item.quantity + 1)">＋</button>
          </div>
          <div class="cart-price">
            <strong>{{ formatPrice(item.subtotal) }}</strong>
            <button type="button" class="plain-link" :aria-label="'移除' + item.productName" :disabled="cart.busy" @click="cart.removeItem(item.id)">移除</button>
          </div>
        </li>
      </ul>
      <aside class="cart-summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading">購物車摘要</h2>
        <dl>
          <div><dt>商品數量</dt><dd>{{ cart.view.totals.quantity }} 件</dd></div>
          <div class="total"><dt>合計</dt><dd>{{ formatPrice(cart.view.totals.amount) }}</dd></div>
        </dl>
        <p class="muted small">課程示範至購物車。</p>
        <RouterLink class="plain-link" to="/products">繼續逛商品</RouterLink>
      </aside>
    </div>
  </template>
</template>
