import { createConnection, ConnectionOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/User.entity';
import { Task } from '../entities/Task.entity';
import { CalendarEvent } from '../entities/Calendar.entity';
import { ChatMessage } from '../entities/Chat.entity';

config();

const options: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oasystem',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Task, CalendarEvent, ChatMessage],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
};

export const initializeDatabase = () => createConnection(options); 