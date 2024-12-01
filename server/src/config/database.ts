import { createConnection } from 'typeorm';
import { User } from '../entities/User.entity';
import { Task } from '../entities/Task.entity';
import { TaskStage } from '../entities/TaskStage.entity';
import { TaskComment } from '../entities/TaskComment.entity';
import { TaskTemplate } from '../entities/TaskTemplate.entity';
import { TaskTemplateStage } from '../entities/TaskTemplateStage.entity';

export const initializeDatabase = async () => {
  try {
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'oasystem',
      entities: [
        User,
        Task,
        TaskStage,
        TaskComment,
        TaskTemplate,
        TaskTemplateStage
      ],
      synchronize: true,
      logging: true
    });
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
} 