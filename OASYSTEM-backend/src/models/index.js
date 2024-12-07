const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// 導入模型
const User = require('./user')(sequelize);
const Note = require('./note')(sequelize);
const NoteContent = require('./noteContent')(sequelize);

// 設置模型關聯
Note.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Note.hasMany(NoteContent, {
  foreignKey: 'noteId',
  as: 'content'
});

NoteContent.belongsTo(Note, {
  foreignKey: 'noteId',
  as: 'note'
});

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

    console.log('Database synchronized successfully.');

    // 檢查是否需要創建 notes 表
    await Note.sync({ alter: true });

  } catch (error) {
    console.error('Unable to initialize database:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  User,
  Note,
  NoteContent,
  initDatabase
}; 