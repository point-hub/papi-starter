import { faker } from '@faker-js/faker';
import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type IUser } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class UserFactory extends BaseFactory<IUser> {
  constructor(public dbConnection: IDatabase, public options?: Record<string, unknown>) {
    super();
  }

  definition() {
    const username = faker.internet.username();
    const email = faker.internet.email();

    return {
      name: faker.person.fullName(),
      username: username,
      trimmed_username: username,
      email: email,
      trimmed_email: email,
      password: faker.internet.password(),
      email_verification: {
        is_verified: true,
        verified_at: new Date(),
      },
      role_id: undefined, // inject
      is_archived: false,
      created_at: new Date(),
    };
  }

  async create() {
    const userCreateRepository = new CreateRepository(this.dbConnection, this.options);
    return await userCreateRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const userCreateManyRepository = new CreateManyRepository(this.dbConnection, this.options);
    return await userCreateManyRepository.handle(this.makeMany(count));
  }
}
