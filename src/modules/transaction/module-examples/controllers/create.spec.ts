import { faker } from '@faker-js/faker'
import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ModuleExampleFactory from '../factory'

describe('create an module example', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('validate unique column', async () => {
    const moduleExampleFactory = new ModuleExampleFactory(DatabaseTestUtil.dbConnection)
    const name = faker.person.fullName()
    moduleExampleFactory.state({
      name: name,
      age: faker.number.int({ min: 25, max: 99 }),
      nationality: { label: 'Indonesia', value: 'ID' },
    })
    await moduleExampleFactory.create()

    // create new module example with same name as above
    const data = {
      name: name,
    }
    const response = await request(app).post('/v1/transaction/module-examples').send(data)

    // expect http response
    expect(response.statusCode).toEqual(422)
    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      name: ['The name is exists.'],
    })

    // expect recorded data
    const moduleExampleRecord = await DatabaseTestUtil.retrieve('module_examples', response.body.inserted_id)
    expect(moduleExampleRecord).toBeNull()
  })
  it('validate schema', async () => {
    const data = {}

    const response = await request(app).post('/v1/transaction/module-examples').send(data)

    // expect http response
    expect(response.statusCode).toEqual(422)

    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      name: ['The name field is required.'],
      age: ['The age field is required.'],
      nationality: ['The nationality field is required.'],
    })

    // expect recorded data
    const moduleExampleRecord = await DatabaseTestUtil.retrieve('module_examples', response.body.inserted_id)
    expect(moduleExampleRecord).toBeNull()
  })
  it('create success', async () => {
    const data = {
      name: faker.person.fullName(),
      age: faker.number.int({ min: 25, max: 99 }),
      nationality: { label: 'Indonesia', value: 'ID' },
    }

    const response = await request(app).post('/v1/transaction/module-examples').send(data)

    // expect http response
    expect(response.statusCode).toEqual(201)

    // expect response json
    expect(response.body.inserted_id).toBeDefined()

    // expect recorded data
    const moduleExampleRecord = await DatabaseTestUtil.retrieve('module_examples', response.body.inserted_id)

    expect(moduleExampleRecord._id).toStrictEqual(response.body.inserted_id)
    expect(moduleExampleRecord['name']).toStrictEqual(data.name)
    expect(moduleExampleRecord['age']).toStrictEqual(data.age)
    expect(moduleExampleRecord['nationality']).toStrictEqual(data.nationality)
    expect(isValid(new Date(moduleExampleRecord['created_at'] as string))).toBeTruthy()
  })
})
