import { faker } from '@faker-js/faker';
import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type IExample } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class ExampleFactory extends BaseFactory<IExample> {
  constructor(public dbConnection: IDatabase, public options?: Record<string, unknown>) {
    super();
  }

  definition() {
    return {
      code: 'EXAMPLE/' + faker.number.int({ min: 1, max: 99999 }).toString().padStart(5, '0'),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 25, max: 99 }),
      gender: faker.person.gender(),
      composite_unique_1: faker.person.fullName(),
      composite_unique_2: faker.person.fullName(),
      notes: faker.lorem.words(),
      optional_unique: faker.person.fullName(),
      optional_composite_unique_1: faker.person.fullName(),
      optional_composite_unique_2: faker.person.fullName(),
      xxx_composite_unique_1: faker.person.fullName(),
      xxx_composite_unique_2: faker.person.fullName(),
      is_archived: false,
      created_at: new Date(),
      created_by_id: undefined, // injected
    } as IExample;
  }

  async create() {
    const createRepository = new CreateRepository(this.dbConnection, this.options);
    return await createRepository.handle(this.makeOne());
  }

  async createMany(count: number) {
    const createManyRepository = new CreateManyRepository(this.dbConnection, this.options);
    return await createManyRepository.handle(this.makeMany(count));
  }
}
