import { defineStore } from 'pinia';

interface State {
  count: number;
}

export const useStore = defineStore('main', {
  state: (): State => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
