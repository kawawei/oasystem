const { Sequelize } = require('sequelize');
const UserModel = require('./user');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

const User = UserModel(sequelize);

module.exports = {
  sequelize,
  User
}; 