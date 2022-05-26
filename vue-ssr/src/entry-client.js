//客户端实现方式使用$mount进行挂载

import { createSsrApp } from './app';

// createSsrApp().mount('#app');

// export default () => {
const { app } = createSsrApp();
app.mount('#app');
// };
