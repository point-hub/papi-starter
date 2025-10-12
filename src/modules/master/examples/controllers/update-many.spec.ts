import { faker } from '@faker-js/faker'
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
        name: faker.person.fullName(),
        age: 25,
        nationality: { label: 'Indonesia', value: 'ID' },
      },
      {
        name: faker.person.fullName(),
        age: 25,
        nationality: { label: 'Indonesia', value: 'ID' },
      },
      {
        name: faker.person.fullName(),
        age: 99,
        nationality: { label: 'Indonesia', value: 'ID' },
      },
    ]
    exampleFactory.sequence(exampleData)
    const resultFactory = await exampleFactory.createMany(3)

    // suspend every example data with name robot
    const response = await request(app)
      .post('/v1/master/examples/update-many')
      .send({
        filter: {
          age: 25,
        },
        data: {
          age: 30,
        },
      })
    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({
      matched_count: 2,
      modified_count: 2,
    })

    // expect recorded data
    const exampleRecord1 = await DatabaseTestUtil.retrieve('examples', resultFactory.inserted_ids[0])
    expect(exampleRecord1['age']).toStrictEqual(30)
    expect(isValid(new Date(exampleRecord1['updated_at'] as string))).toBeTruthy()

    const exampleRecord2 = await DatabaseTestUtil.retrieve('examples', resultFactory.inserted_ids[1])
    expect(exampleRecord2['age']).toStrictEqual(30)
    expect(isValid(new Date(exampleRecord2['updated_at'] as string))).toBeTruthy()

    // expect unmodified data
    const exampleRecord3 = await DatabaseTestUtil.retrieve('examples', resultFactory.inserted_ids[2])
    expect(exampleRecord3['age']).toStrictEqual(99)
    expect(isValid(new Date(exampleRecord3['updated_at'] as string))).toBeFalsy()
  })
})
