import { faker } from '@faker-js/faker';
import { BaseFactory, type IDatabase } from '@point-hub/papi';

import { type IAuditLog } from './interface';
import { CreateRepository } from './repositories/create.repository';
import { CreateManyRepository } from './repositories/create-many.repository';

export default class AuditLogFactory extends BaseFactory<IAuditLog> {
  constructor(public dbConnection: IDatabase, public options?: Record<string, unknown>) {
    super();
  }

  definition() {
    const changeableFields = ['name', 'email', 'status', 'role', 'age'];
    const changedFields = faker.helpers.arrayElements(
      changeableFields,
      faker.number.int({ min: 1, max: 3 }),
    );
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};

    for (const field of changedFields) {
      switch (field) {
        case 'name':
          before[field] = faker.person.fullName();
          after[field] = faker.person.fullName();
          break;
        case 'email':
          before[field] = faker.internet.email();
          after[field] = faker.internet.email();
          break;
        case 'status':
          before[field] = faker.helpers.arrayElement(['inactive', 'pending']);
          after[field] = faker.helpers.arrayElement(['active']);
          break;
        case 'role':
          before[field] = faker.helpers.arrayElement(['user']);
          after[field] = faker.helpers.arrayElement(['admin', 'manager']);
          break;
        case 'age':
          before[field] = faker.number.int({ min: 18, max: 40 });
          after[field] = faker.number.int({ min: 41, max: 70 });
          break;
      }
    }

    return {
      audit_log_id: undefined, // injected
      entity_type: faker.helpers.arrayElement(['user', 'project', 'order']),
      entity_id: faker.string.uuid(),
      human_identifier: faker.person.fullName(),
      actor_type: undefined, // injected
      actor_id: undefined, // injected
      action: faker.helpers.arrayElement(['create', 'update', 'delete']),
      message: faker.word.words(),
      reason: faker.word.words(),
      changes: {
        summary: {
          fields: changedFields,
          count: changedFields.length,
        },
        snapshot: {
          before,
          after,
        },
      },
      created_at: new Date(),
    } as IAuditLog;
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
