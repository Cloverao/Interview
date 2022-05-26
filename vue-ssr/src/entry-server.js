//防止创建函数被污染，每次都创建一个新的

import { createSsrApp } from './app';
export default () => {
  const { app } = createSsrApp();
  return app;
};
