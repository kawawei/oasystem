const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

app.use('/proxy', createProxyMiddleware({
  target: 'https://www.google.com',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': ''
  }
}))

module.exports = app 