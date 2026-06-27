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

  /** Flat-illustration artwork (object-storage URL). Generated async; nullable
   *  until the image provider returns. */
  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  /** User id of a community contributor, or null for built-in/admin entries.
   *  User-added ingredients are public immediately. */
  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
