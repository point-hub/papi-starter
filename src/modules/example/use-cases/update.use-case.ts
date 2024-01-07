import type { ISchemaValidation, IUpdateOutput, IUpdateRepository, IUseCase } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import { updateValidation } from '../validations/update.validation'

export interface IInput {
  _id: string
  data: {
    name?: string
    phone?: string
  }
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class UpdateExampleUseCase implements IUseCase<IInput, IDeps, IOptions, IUpdateOutput> {
  constructor(public repository: IUpdateRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateOutput> {
    // 1. define entity
    const exampleEntity = new ExampleEntity({
      name: input.data.name,
      phone: input.data.phone,
    })
    exampleEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(exampleEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, updateValidation)
    // 3. database operation
    return await this.repository.handle(input._id, cleanEntity, options)
  }
}
