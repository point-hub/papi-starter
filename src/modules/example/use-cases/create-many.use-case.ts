import type { ICreateManyOutput, ICreateManyRepository, ISchemaValidation, IUseCase } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import { createManyValidation } from '../validations/create-many.validation'

export interface IInput {
  examples: {
    name?: string
    phone?: string
  }[]
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class CreateManyExampleUseCase implements IUseCase<IInput, IDeps, IOptions, ICreateManyOutput> {
  constructor(public repository: ICreateManyRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateManyOutput> {
    const entities = []
    for (const document of input.examples) {
      const exampleEntity = new ExampleEntity({
        name: document.name,
        phone: document.phone,
      })
      exampleEntity.generateCreatedDate()
      entities.push(deps.cleanObject(exampleEntity.data))
    }
    await deps.schemaValidation({ examples: entities }, createManyValidation)
    return await this.repository.handle(entities, options)
  }
}
