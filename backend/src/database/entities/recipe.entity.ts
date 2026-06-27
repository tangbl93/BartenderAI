import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface RecipeItemSnapshot {
  ingredientId: string;
  name: string;
  amount: string;
  optional: boolean;
}

export interface ToolSubstitution {
  tool: string;
  homeAlternative: string;
}

@Entity('recipes')
export class RecipeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  tagline: string;

  @Column()
  locale: string;

  @Column({ type: 'simple-json' })
  items: RecipeItemSnapshot[];

  @Column({ type: 'simple-json' })
  steps: string[];

  @Column({ type: 'simple-json' })
  toolSubstitutions: ToolSubstitution[];

  @Column()
  alcoholRange: string;

  @Column({ type: 'simple-json' })
  safetyNotes: string[];

  /** Ingredient IDs originally selected by the user. */
  @Column({ type: 'simple-json' })
  ingredientIds: string[];

  @Column({ default: false })
  isExample: boolean;

  /** Flat-illustration artwork (object-storage URL). Generated async; nullable
   *  until the image provider returns. */
  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownerId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
