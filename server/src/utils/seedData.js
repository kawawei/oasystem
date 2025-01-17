const { User } = require('../models');

module.exports = async function seedData() {
  try {
    // 創建管理員用戶
    await User.create({
      username: 'admin',
      password: '123456',
      role: 'admin',
      status: 'active'
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}; 