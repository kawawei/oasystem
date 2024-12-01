import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { UserRole, UserStatus } from '../types';
import bcrypt from 'bcryptjs';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status!: UserStatus;

  @Column({ 
    type: 'datetime', 
    nullable: true 
  })
  lastLogin!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<User> = {}) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
      console.log('Password hashed successfully')
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('Comparing passwords:', {
        candidate: candidatePassword,
        hashed: this.password
      })
      const result = await bcrypt.compare(candidatePassword, this.password)
      console.log('Password comparison result:', result)
      return result
    } catch (error) {
      console.error('Password comparison error:', error)
      return false
    }
  }
} 