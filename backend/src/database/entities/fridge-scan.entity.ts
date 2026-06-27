import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * A saved "fridge scan" / bar inventory snapshot for one user. Holds the set of
 * ingredient ids the user had on hand (from a simulated scan or manual pick),
 * plus a human-readable summary and an optional reference photo. Used to power
 * "recent scans" history and restoring the current inventory.
 */
@Entity('fridge_scans')
export class FridgeScanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  /** Ingredient ids captured in this scan. */
  @Column({ type: 'simple-json' })
  ingredientIds: string[];

  /** Display summary, e.g. "Gin, Lime, Tonic". */
  @Column()
  summary: string;

  /** Optional reference photo URL for the scan. */
  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
