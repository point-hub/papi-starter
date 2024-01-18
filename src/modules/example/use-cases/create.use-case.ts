import type { ICreateOutput, ICreateRepository, ISchemaValidation } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  phone?: string
}
export interface IDeps {
  cleanObject(object: object): object
  createRepository: ICreateRepository
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class CreateExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
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
    return { insertedId: response.insertedId }
  }
}
