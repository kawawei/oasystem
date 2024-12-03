const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  // TODO: 實現搜索邏輯
  res.json({
    results: [
      {
        id: 1,
        title: '搜索結果示例',
        url: 'https://example.com',
        description: '這是一個搜索結果示例'
      }
    ]
  });
});

module.exports = app; 