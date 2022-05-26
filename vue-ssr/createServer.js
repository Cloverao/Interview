//创建app
// const { createApp } = require('vue');
//引入ssr
const { renderToString, render } = require('@vue/server-renderer');
const server = require('express')();
const fs = require('fs');
const path = require('path');
const express = require('express');
// import app from './src/app';
// Cannot use import statement outside a module
//node服务端不能使用import语法
const indexTemplate = fs.readFileSync(
  path.resolve(__dirname, './dist/index.ssr.html'),
  'utf-8'
);
console.log(indexTemplate);
const createApp = require('./dist/server.bundle').default;
console.log(createApp);
// server.use(express.static(path.join(__dirname, './dist')));

server.get('*', async (req, res) => {
  const app = createApp();

  const appContent = await renderToString(app);
  const html = indexTemplate
    .toString()
    .replace('<div id="app">', `<div id="app">${appContent}`);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

server.listen(8080);
