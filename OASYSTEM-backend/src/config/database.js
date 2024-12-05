const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('oasystem', 'root', 'ben01270127', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize; 