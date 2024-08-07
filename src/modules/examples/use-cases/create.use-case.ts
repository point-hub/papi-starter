import type { ISchemaValidation } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import type { ICreateExampleRepository } from '../repositories/create.repository'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  phone?: string
}
export interface IDeps {
  cleanObject(object: object): object
  createRepository: ICreateExampleRepository
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}
export interface IOutput {
  inserted_id: string
}

export class CreateExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
    // 1. define entity
    const exampleEntity = new ExampleEntity({
      name: input.name,
      phone: input.phone,
    })
    exampleEntity.generateCreatedDate()
    const cleanEntity = deps.cleanObject(exampleEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, createValidation)
    // 3. database operation
    const response = await deps.createRepository.handle(cleanEntity, options)
    return { inserted_id: response.inserted_id }
  }
}
