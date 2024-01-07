import type { IDeleteOutput, IDeleteRepository, ISchemaValidation, IUseCase } from '@point-hub/papi'

import { deleteValidation } from '../validations/delete.validation'

export interface IInput {
  _id: string
}
export interface IDeps {
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class DeleteExampleUseCase implements IUseCase<IInput, IDeps, IOptions, IDeleteOutput> {
  constructor(public repository: IDeleteRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IDeleteOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, deleteValidation)
    // 2. database operation
    return await this.repository.handle(input._id, options)
  }
}
