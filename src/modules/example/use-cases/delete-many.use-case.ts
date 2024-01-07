import type { IDeleteManyOutput, IDeleteManyRepository, ISchemaValidation, IUseCase } from '@point-hub/papi'

import { deleteManyValidation } from '../validations/delete-many.validation'

export interface IInput {
  ids: string[]
}
export interface IDeps {
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class DeleteManyExampleUseCase implements IUseCase<IInput, IDeps, IOptions, IDeleteManyOutput> {
  constructor(public repository: IDeleteManyRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IDeleteManyOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, deleteManyValidation)
    // 2. database operation
    return await this.repository.handle(input.ids, options)
  }
}
