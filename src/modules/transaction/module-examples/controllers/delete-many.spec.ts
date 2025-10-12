import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ModuleExampleFactory from '../factory'

describe('delete many module_examples', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('delete success', async () => {
    const moduleExampleFactory = new ModuleExampleFactory(DatabaseTestUtil.dbConnection)
    const resultFactory = await moduleExampleFactory.createMany(3)

    const response = await request(app)
      .post('/v1/transaction/module-examples/delete-many')
      .send({
        ids: [resultFactory.inserted_ids[0], resultFactory.inserted_ids[1]],
      })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({ deleted_count: 2 })

    // expect recorded data
    const moduleExampleRecord1 = await DatabaseTestUtil.retrieve('module_examples', resultFactory.inserted_ids[0])
    expect(moduleExampleRecord1).toBeNull()
    const moduleExampleRecord2 = await DatabaseTestUtil.retrieve('module_examples', resultFactory.inserted_ids[1])
    expect(moduleExampleRecord2).toBeNull()

    const moduleExampleRecords = await DatabaseTestUtil.retrieveAll('module_examples')
    expect(moduleExampleRecords.data.length).toStrictEqual(1)
  })
})
