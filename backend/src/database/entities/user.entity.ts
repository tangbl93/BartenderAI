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

  // GAID / device id for silent auto-login. Null for password accounts.
  @Column({ unique: true, nullable: true, type: 'varchar' })
  deviceId: string | null;

  @Column({ default: false })
  isDevice: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
