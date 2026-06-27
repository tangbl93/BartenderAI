import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IngredientCategory } from '../../common/constants';

@Entity('ingredients')
export class IngredientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  category: IngredientCategory;

  /** Multi-language display names: { en, zh-CN, zh-TW, ja, ko } */
  @Column({ type: 'simple-json' })
  names: Record<string, string>;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
