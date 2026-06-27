import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PosterEntity } from './poster.entity';

export type PosterJobStatus =
  | 'pending'
  | 'running'
  | 'partial'
  | 'done'
  | 'failed';

@Entity('poster_jobs')
export class PosterJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipeId: string;

  @Column({ type: 'varchar', nullable: true })
  ownerId: string | null;

  @Column({ default: 'en' })
  locale: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: PosterJobStatus;

  @OneToMany(() => PosterEntity, (poster) => poster.job, {
    cascade: true,
    eager: true,
  })
  posters: PosterEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
