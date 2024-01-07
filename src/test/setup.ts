import { DatabaseTestUtil } from '@point-hub/papi'
import { afterAll, beforeAll } from 'bun:test'

import mongoDBConfig from '@/config/mongodb'

import { TestUtil } from './utils'

beforeAll(async () => {
  console.info('initiate database connection')
  await DatabaseTestUtil.open(mongoDBConfig.url, mongoDBConfig.name)
  console.info('generate database collection schema')
  await DatabaseTestUtil.createCollections(await TestUtil.getSchema())
})

afterAll(async () => {
  console.info('close database connection')
  await DatabaseTestUtil.close()
})
