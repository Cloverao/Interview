import { createApp } from 'vue';
import App from './App.vue';

export function createSsrApp() {
  // const app = new Vue({
  //   render: (h) => h(App),
  // });
  // return { app };

  const app = createApp(App);
  return { app };

  // createApp(Counter).mount('#counter');
}
