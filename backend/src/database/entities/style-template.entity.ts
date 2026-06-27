import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TextAlign = 'left' | 'center' | 'right';
export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';
export type TextRenderMode = 'model' | 'backend';

export interface LayoutConfig {
  textAlign: TextAlign;
  watermarkPosition: WatermarkPosition;
}

@Entity('style_templates')
export class StyleTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  dimension: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'simple-json' })
  layout: LayoutConfig;

  @Column({ type: 'varchar', default: 'backend' })
  textRenderMode: TextRenderMode;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 1 })
  version: number;

  /** Reference image (i2i use-case) stored in object storage. Nullable. */
  @Column({ type: 'varchar', nullable: true })
  referenceImageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
