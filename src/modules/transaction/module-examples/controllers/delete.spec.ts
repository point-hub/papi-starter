import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ModuleExampleFactory from '../factory'

describe('delete an module example', async () => {
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

    const response = await request(app).delete(`/v1/transaction/module-examples/${resultFactory.inserted_ids[1]}`)

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({ deleted_count: 1 })

    // expect recorded data
    const moduleExampleRecord = await DatabaseTestUtil.retrieve('module_examples', resultFactory.inserted_ids[1])
    expect(moduleExampleRecord).toBeNull()

    const moduleExampleRecords = await DatabaseTestUtil.retrieveAll('module_examples')
    expect(moduleExampleRecords.data.length).toStrictEqual(2)
  })
})
