require('dotenv').config()
const app = require('./app')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // 同步資料庫模型
    await sequelize.sync()
    console.log('Database synced successfully')

    // 啟動服務器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer() 