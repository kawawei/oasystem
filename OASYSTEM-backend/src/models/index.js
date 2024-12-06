const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// 導入模型
const User = require('./user')(sequelize);
// ... 其他模型導入

// 初始化數據庫
async function initDatabase() {
  try {
    // 檢查數據庫連接
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // 同步數據庫結構
    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    const alterSync = process.env.DB_ALTER_SYNC === 'true';
    
    await sequelize.sync({ 
      force: forceSync,    // 是否強制重建表
      alter: alterSync     // 是否允許修改表結構
    });

    // 檢查是否需要創建默認用戶
    const userCount = await User.count();
    if (userCount === 0) {
      // 創建默認管理員用戶
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created.');
    }

    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to initialize database:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  User,
  // ... 其他模型導出
  initDatabase
}; 