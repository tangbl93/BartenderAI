import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/constants';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  account: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, type: 'varchar' })
  displayName: string | null;

  @Column({ type: 'varchar', default: 'user' })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}
