import { defineStore } from 'pinia';
import { request } from '../api.js';

const empty = () => ({ items: [], totals: { quantity: 0, amount: 0 } });

export const useCart = defineStore('cart', {
  state: () => ({ ownerId: null, view: empty(), busy: false, loaded: false, error: '' }),
  actions: {
    reset(ownerId) {
      this.ownerId = ownerId;
      this.view = empty();
      this.busy = false;
      this.loaded = false;
      this.error = '';
    },
    async run(path, options) {
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
    load() {
      return this.run('/cart');
    },
    add(variantId, quantity, key) {
      return this.run('/cart/items', {
        method: 'POST',
        body: { variantId, quantity },
        headers: { 'Idempotency-Key': key },
      });
    },
    setQuantity(id, quantity) {
      return this.run('/cart/items/' + id, { method: 'PATCH', body: { quantity } });
    },
    remove(id) {
      return this.run('/cart/items/' + id, { method: 'DELETE' });
    },
  },
});
