import { defineStore } from 'pinia';
import { request } from '../api.js';

export const useSession = defineStore('session', {
  state: () => ({ user: null, status: 'loading', error: '' }),
  actions: {
    async refresh() {
      this.status = 'loading';
      this.error = '';
      try {
        this.user = (await request('/auth/session')).data.user;
        this.status = 'ready';
      } catch (error) {
        this.error = error.message;
        this.status = 'error';
      }
    },
    async signIn(email, password) {
      const { data } = await request('/auth/login', { method: 'POST', body: { email, password } });
      this.user = data.user;
      this.status = 'ready';
    },
    async signOut() {
      await request('/auth/logout', { method: 'POST' });
      this.user = null;
      this.status = 'ready';
    },
  },
});
