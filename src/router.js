import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import ProductsView from './views/ProductsView.vue';
import ProductView from './views/ProductView.vue';
import AccountView from './views/AccountView.vue';
import CartView from './views/CartView.vue';

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path !== from.path) return { top: 0 };
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/products/:id', name: 'product', component: ProductView },
    { path: '/login', name: 'login', component: AccountView },
    { path: '/register', name: 'register', component: AccountView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/:catchAll(.*)*', redirect: '/products' },
  ],
});
