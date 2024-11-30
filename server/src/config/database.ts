import { createConnection } from 'typeorm';
import { User } from '../entities/User.entity';
import { Task } from '../entities/Task.entity';
import { CalendarEvent } from '../entities/Calendar.entity';
import { ChatMessage } from '../entities/Chat.entity';

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
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'ben01270127',
      database: 'oasystem',
      entities: [User, Task, CalendarEvent, ChatMessage],
      synchronize: process.env.NODE_ENV === 'development',
      logging: true
    });
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
} 