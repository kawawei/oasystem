const axios = require('axios');

class SearchController {
  async search(req, res) {
    try {
      const { q } = req.query;
      
      // TODO: 這裡先模擬搜索結果，之後可以接入實際的搜索引擎 API
      const results = [
        {
          id: 1,
          title: 'Vue.js - The Progressive JavaScript Framework',
          url: 'https://vuejs.org',
          favicon: 'https://vuejs.org/favicon.ico',
          description: 'Vue.js 是一個漸進式的 JavaScript 框架，用於構建用戶界面。'
        },
        {
          id: 2,
          title: 'React – A JavaScript library for building user interfaces',
          url: 'https://reactjs.org',
          favicon: 'https://reactjs.org/favicon.ico',
          description: 'React 是一個用於構建用戶界面的 JavaScript 庫。'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.description.toLowerCase().includes(q.toLowerCase())
      );

      res.json({
        query: q,
        total: results.length,
        results
      });
    } catch (error) {
      res.status(500).json({
        message: '搜索失敗',
        error: error.message
      });
    }
  }
}

module.exports = new SearchController(); 