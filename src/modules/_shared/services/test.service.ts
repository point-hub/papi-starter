import { type IDatabase } from '@point-hub/papi';

import CounterFactory from '@/modules/counters/factory';
import RoleFactory from '@/modules/master/roles/factory';
import UserFactory from '@/modules/master/users/factory';
import { TokenService } from '@/modules/master/users/services/token.service';

import { getCounters } from '../data/counters';

export interface IAuthUserResponse {
  _id: string
}

export interface IGrantAccess {
  role?: string
  permissions: string[]
}

export interface IAuthUserWithTokenResponse extends IAuthUserResponse {
  accessToken: string
}

export interface ITestService {
  createAuthUser(grantAccess: IGrantAccess): Promise<IAuthUserResponse>
  createAuthUserAndGetAccessToken(grantAccess: IGrantAccess): Promise<IAuthUserResponse>
  seedCounters(): Promise<void>
}

export class TestService implements ITestService {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async createAuthUser(grantAccess: IGrantAccess): Promise<IAuthUserResponse> {
    // create role
    const roleFactory = new RoleFactory(this.database, this.options);
    roleFactory.state({
      permissions: grantAccess.permissions,
      ...(grantAccess.role && { name: grantAccess.role }),
    });
    const responseCreateRole = await roleFactory.create();

    // create user
    const userFactory = new UserFactory(this.database);
    userFactory.state({
      role_id: responseCreateRole.inserted_id,
    });
    const createUserResponse = await userFactory.create();

    return {
      _id: createUserResponse.inserted_id,
    };
  }

  async createAuthUserAndGetAccessToken(grantAccess: IGrantAccess): Promise<IAuthUserWithTokenResponse> {
    const createUserResponse = await this.createAuthUser(grantAccess);
    return {
      _id: createUserResponse._id,
      accessToken: TokenService.createAccessToken(createUserResponse._id),
    };
  }

  async seedCounters(): Promise<void> {
    // seed default counters
    const counterFactory = new CounterFactory(this.database);
    const counters = getCounters();
    for (const counter of counters) {
      counterFactory.state(counter);
      await counterFactory.create();
    }
  }
};
