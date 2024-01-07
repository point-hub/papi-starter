import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ExampleFactory from '../factory'

describe('update many examples', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('update success', async () => {
    const exampleFactory = new ExampleFactory(DatabaseTestUtil.dbConnection)
    const exampleData = [
      {
        phone: '',
      },
      {
        phone: '',
      },
      {
        phone: '12345678',
      },
    ]
    exampleFactory.sequence(exampleData)
    const resultFactory = await exampleFactory.createMany(3)

    // suspend every example data with name robot
    const response = await request(app)
      .post('/v1/examples/update-many')
      .send({
        filter: {
          phone: '',
        },
        data: {
          phone: '11223344',
        },
      })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({
      matchedCount: 2,
      modifiedCount: 2,
    })

    // expect recorded data
    const exampleRecord1 = await DatabaseTestUtil.retrieve('examples', resultFactory.insertedIds[0])
    expect(exampleRecord1.phone).toStrictEqual('11223344')
    expect(isValid(new Date(exampleRecord1.updated_date as string))).toBeTruthy()

    const exampleRecord2 = await DatabaseTestUtil.retrieve('examples', resultFactory.insertedIds[1])
    expect(exampleRecord2.phone).toStrictEqual('11223344')
    expect(isValid(new Date(exampleRecord2.updated_date as string))).toBeTruthy()

    // expect unmodified data
    const exampleRecord3 = await DatabaseTestUtil.retrieve('examples', resultFactory.insertedIds[2])
    expect(exampleRecord3.phone).toStrictEqual('12345678')
    expect(isValid(new Date(exampleRecord3.updated_date as string))).toBeFalsy()
  })
})
