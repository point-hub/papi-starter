import { faker } from '@faker-js/faker'
import { BaseFactory, type IDatabase } from '@point-hub/papi'

import { type IModuleExampleEntity } from './interface'
import { CreateModuleExampleRepository } from './repositories/create.repository'
import { CreateManyModuleExampleRepository } from './repositories/create-many.repository'

export default class ModuleExampleFactory extends BaseFactory<IModuleExampleEntity> {
  constructor(public dbConnection: IDatabase) {
    super()
  }

  definition() {
    return {
      name: faker.person.fullName(),
      age: faker.number.int({ min: 25, max: 99 }),
      nationality: { label: 'Indonesia', value: 'ID' },
      created_at: new Date(),
    }
  }

  async create() {
    const createRepository = new CreateModuleExampleRepository(this.dbConnection)
    return await createRepository.handle(this.makeOne())
  }

  async createMany(count: number) {
    const createManyRepository = new CreateManyModuleExampleRepository(this.dbConnection)
    return await createManyRepository.handle(this.makeMany(count))
  }
}
