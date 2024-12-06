const cron = require('node-cron');
const backup = require('./backup');

// 設置定時任務
function setupBackupSchedule() {
  // 每天凌晨3點執行備份
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('Starting scheduled backup...');
      await backup.createBackup();
      // 清理7天前的備份
      await backup.cleanOldBackups(7);
      console.log('Scheduled backup completed');
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  });
}

module.exports = {
  setupBackupSchedule
}; 