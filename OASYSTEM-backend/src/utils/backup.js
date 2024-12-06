const { exec } = require('child_process');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    // 確保備份目錄存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `backup_${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    const command = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filePath}`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Backup error:', error);
          reject(error);
          return;
        }
        console.log(`Database backup created: ${filename}`);
        resolve(filePath);
      });
    });
  }

  async restoreBackup(backupFile) {
    const command = `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${backupFile}`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Restore error:', error);
          reject(error);
          return;
        }
        console.log('Database restored successfully');
        resolve();
      });
    });
  }

  // 自動清理舊備份
  async cleanOldBackups(daysToKeep = 7) {
    const files = fs.readdirSync(this.backupDir);
    const now = moment();

    files.forEach(file => {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      const fileDate = moment(stats.mtime);
      const daysDiff = now.diff(fileDate, 'days');

      if (daysDiff > daysToKeep) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old backup: ${file}`);
      }
    });
  }
}

module.exports = new DatabaseBackup(); 