import type { ISchemaValidation } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import type { ICreateManyExampleRepository } from '../repositories/create-many.repository'
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
  createManyRepository: ICreateManyExampleRepository
}
export interface IOptions {
  session?: unknown
}
export interface IOutput {
  inserted_count: number
  inserted_ids: string[]
}

export class CreateManyExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
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
    const response = await deps.createManyRepository.handle(entities, options)
    return {
      inserted_ids: response.inserted_ids,
      inserted_count: response.inserted_count,
    }
  }
}
