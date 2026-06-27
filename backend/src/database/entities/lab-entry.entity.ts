import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LabResult = 'success' | 'fail';
// New default shared state is `public` (submit == public). `hidden` is the
// violation-hide state. Legacy pending/approved/rejected kept for back-compat.
export type ModerationStatus =
  | 'private'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'public'
  | 'hidden';

@Entity('lab_entries')
export class LabEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  recipeId: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'varchar' })
  result: LabResult;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'varchar', default: 'private' })
  moderationStatus: ModerationStatus;

  /** Simple popularity counter used for "hot" sorting on the wall. */
  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
