import { DatabaseTestUtil } from '@point-hub/papi';
import { afterAll, beforeAll } from 'bun:test';

import mongoDBConfig from '@/config/mongodb';

import { TestUtil } from './utils';

beforeAll(async () => {
  console.info(`initiate database connection ${mongoDBConfig.name}`);
  await DatabaseTestUtil.open(mongoDBConfig.url, mongoDBConfig.name);
  console.info(`drop database ${mongoDBConfig.name}`);
  await DatabaseTestUtil.dbConnection.dropDatabase();
  console.info('generate database collection schema');
  await DatabaseTestUtil.createCollections(await TestUtil.getSchema());
}, 10_000);

afterAll(async () => {
  console.info('close database connection');
  await DatabaseTestUtil.close();
});
