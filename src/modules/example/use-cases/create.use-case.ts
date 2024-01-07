import type { ICreateOutput, ICreateRepository, ISchemaValidation, IUseCase } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  phone?: string
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class CreateExampleUseCase implements IUseCase<IInput, IDeps, IOptions, ICreateOutput> {
  constructor(public repository: ICreateRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
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
    return await this.repository.handle(cleanEntity, options)
  }
}
