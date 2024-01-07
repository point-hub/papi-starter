import { faker } from '@faker-js/faker'
import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

describe('create many examples', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('validate schema', async () => {
    const data = [
      {
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        phone: faker.phone.number(),
      },
    ]

    const response = await request(app).post('/v1/examples/create-many').send({ examples: data })

    // expect http response
    expect(response.statusCode).toEqual(422)

    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      'examples.0.name': ['The examples.0.name field is required.'],
      'examples.2.name': ['The examples.2.name field is required.'],
    })

    // expect recorded data
    const exampleRecords = await DatabaseTestUtil.retrieveAll('examples')
    expect(exampleRecords.data.length).toStrictEqual(0)
  })
  it('create success', async () => {
    const data = [
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
    ]

    const response = await request(app).post('/v1/examples/create-many').send({ examples: data })

    // expect http response
    expect(response.statusCode).toEqual(201)

    // expect response json
    expect(response.body.insertedCount).toBe(3)
    expect(response.body.insertedIds.length).toBe(3)

    // expect recorded data
    const exampleRecords = await DatabaseTestUtil.retrieveAll('examples', {
      filter: {
        _id: {
          $in: response.body.insertedIds,
        },
      },
    })

    for (const [index, exampleRecord] of exampleRecords.data.entries()) {
      expect(exampleRecord._id).toStrictEqual(response.body.insertedIds[index])
      expect(exampleRecord.name).toStrictEqual(data[index].name)
      expect(exampleRecord.phone).toStrictEqual(data[index].phone)
      expect(isValid(new Date(exampleRecord.created_date as string))).toBeTruthy()
    }
  })
})
