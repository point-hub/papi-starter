import { DatabaseTestUtil } from '@point-hub/papi';
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import type { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { type IAuthUserWithTokenResponse, TestService } from '@/modules/_shared/services/test.service';
import UserFactory from '@/modules/master/users/factory';

import CounterFactory from '../factory';

describe('retrieve an counter', async () => {
  let app: Express;
  let authorizedUser: IAuthUserWithTokenResponse;

  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection });
  });

  beforeEach(async () => {
    await DatabaseTestUtil.reset();

    const testService = new TestService(DatabaseTestUtil.dbConnection);
    authorizedUser = await testService.createAuthUserAndGetAccessToken({
      permissions: [],
    });
  });

  it('E.1. fails when the user is not authenticated', async () => {
    const response = await request(app)
      .get('/v1/counters/by-name')
      .set('Authorization', 'Bearer');

    // expect http response
    expect(response.statusCode).toEqual(401);

    // expect response json
    expect(response.body.code).toStrictEqual(401);
    expect(response.body.message).toStrictEqual('Authentication credentials is invalid.');
  });

  it('S.1. succeeds', async () => {
    const userFactory = new UserFactory(DatabaseTestUtil.dbConnection);
    await userFactory.create();

    const counterFactory = new CounterFactory(DatabaseTestUtil.dbConnection);
    await counterFactory.state({
      name: 'sales',
      template: 'INVOICE/<seq>/<yyyy><mm>',
      seq: 0,
      seq_pad: 4,
    }).create();

    const date = new Date();

    const response = await request(app)
      .get('/v1/counters/by-name')
      .set('Authorization', `Bearer ${authorizedUser.accessToken}`)
      .query({
        name: 'sales',
        date: date,
      });

    // expect http response
    expect(response.statusCode).toEqual(200);

    // expect response json
    expect(response.body._id).toBeDefined();
    expect(response.body.value).toStrictEqual(`INVOICE/0001/${new Date(date).getFullYear()}${(new Date(date).getMonth() + 1)}`);
  });
});
