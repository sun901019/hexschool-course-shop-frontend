import { defineStore } from 'pinia';
import { request } from '../api.js';

const createEmptyCart = () => ({ items: [], totals: { quantity: 0, amount: 0 } });

export const useCart = defineStore('cart', {
  state: () => ({ ownerId: null, view: createEmptyCart(), busy: false, loaded: false, error: '' }),
  actions: {
    reset(ownerId) {
      this.ownerId = ownerId;
      this.view = createEmptyCart();
      this.busy = false;
      this.loaded = false;
      this.error = '';
    },
    async syncCart(path, options) {
      if (this.busy) return false;
      const owner = this.ownerId;
      this.busy = true;
      this.error = '';
      try {
        const next = await request(path, options);
        if (this.ownerId !== owner) return false;
        this.view = next.data;
        this.loaded = true;
        return true;
      } catch (error) {
        if (this.ownerId === owner) this.error = error.message;
        return false;
      } finally {
        if (this.ownerId === owner) this.busy = false;
      }
    },
    loadCart() {
      return this.syncCart('/cart');
    },
    addItem(variantId, quantity, key) {
      return this.syncCart('/cart/items', {
        method: 'POST',
        body: { variantId, quantity },
        headers: { 'Idempotency-Key': key },
      });
    },
    updateItemQuantity(id, quantity) {
      return this.syncCart('/cart/items/' + id, { method: 'PATCH', body: { quantity } });
    },
    removeItem(id) {
      return this.syncCart('/cart/items/' + id, { method: 'DELETE' });
    },
  },
});
