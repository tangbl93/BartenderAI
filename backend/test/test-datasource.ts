import { DataSource } from 'typeorm';
import { ENTITIES } from '../src/database/entities';

/** Fresh in-memory SQLite DataSource for isolated service unit tests. */
export async function createTestDataSource(): Promise<DataSource> {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: ENTITIES,
    synchronize: true,
    dropSchema: true,
  });
  await ds.initialize();
  return ds;
}
