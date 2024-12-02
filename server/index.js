require('dotenv').config()
const app = require('./app')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // 測試資料庫連接
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')

    // 同步資料庫模型
    await sequelize.sync({ alter: true })
    console.log('Database synced successfully')

    // 啟動服務器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log('Environment:', process.env.NODE_ENV)
      console.log('Database config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      })
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    process.exit(1)
  }
}

startServer() 