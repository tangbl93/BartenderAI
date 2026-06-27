import { DataSourceOptions } from 'typeorm';
import { ENTITIES } from './entities';

/**
 * Build TypeORM connection options.
 *
 * Dev default: SQLite file DB (zero external services).
 * If DATABASE_URL points at postgres, use that instead so prod is configurable.
 */
export function buildDataSourceOptions(env: NodeJS.ProcessEnv): DataSourceOptions {
  const url = env.DATABASE_URL;
  const isPostgres = !!url && url.startsWith('postgres');

  if (isPostgres) {
    return {
      type: 'postgres',
      url,
      entities: ENTITIES,
      synchronize: true,
    };
  }

  // In-memory DB for tests, file DB otherwise.
  const database =
    env.NODE_ENV === 'test'
      ? ':memory:'
      : env.SQLITE_PATH || 'bartender-dev.sqlite';

  return {
    type: 'sqlite',
    database,
    entities: ENTITIES,
    synchronize: true,
    dropSchema: env.NODE_ENV === 'test',
  };
}
