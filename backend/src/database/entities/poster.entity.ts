import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LayoutConfig, TextRenderMode } from './style-template.entity';
import { PosterJobEntity } from './poster-job.entity';

export type PosterStatus = 'pending' | 'running' | 'done' | 'failed';

/** Snapshot of the template at job-creation time so later edits never change it. */
export interface TemplateSnapshot {
  id: string;
  name: string;
  dimension: string;
  prompt: string;
  layout: LayoutConfig;
  textRenderMode: TextRenderMode;
  version: number;
}

@Entity('posters')
export class PosterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PosterJobEntity, (job) => job.posters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'jobId' })
  job: PosterJobEntity;

  @Column()
  jobId: string;

  @Column({ type: 'varchar' })
  dimension: string;

  @Column({ type: 'varchar' })
  templateId: string;

  /** Frozen template config used to render this poster. */
  @Column({ type: 'simple-json' })
  templateSnapshot: TemplateSnapshot;

  @Column({ type: 'varchar', default: 'pending' })
  status: PosterStatus;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  /** Poster text snapshot taken from the recipe — guarantees text matches recipe. */
  @Column({ type: 'simple-json', nullable: true })
  textSnapshot: Record<string, any> | null;

  @Column({ type: 'varchar', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
