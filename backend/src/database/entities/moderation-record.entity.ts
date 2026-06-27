import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ModerationDecision = 'approve' | 'reject';

@Entity('moderation_records')
export class ModerationRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The lab entry that was reviewed. */
  @Column()
  targetId: string;

  /** Reviewer (operator/admin) user id. */
  @Column()
  reviewerId: string;

  @Column({ type: 'varchar' })
  decision: ModerationDecision;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
