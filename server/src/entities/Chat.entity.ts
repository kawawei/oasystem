import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User.entity';

@Entity('chat_messages')
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @ManyToOne(() => User)
  sender!: User;

  @Column('simple-array')
  recipients!: string[];

  @Column()
  chatRoomId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isRead!: boolean;

  constructor(partial: Partial<ChatMessage> = {}) {
    super();
    Object.assign(this, partial);
  }
} 