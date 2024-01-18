import type { IDeleteManyOutput, IDeleteManyRepository, ISchemaValidation } from '@point-hub/papi'

import { deleteManyValidation } from '../validations/delete-many.validation'

export interface IInput {
  ids: string[]
}
export interface IDeps {
  schemaValidation: ISchemaValidation
  deleteManyRepository: IDeleteManyRepository
}
export interface IOptions {
  session?: unknown
}

export class DeleteManyExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IDeleteManyOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, deleteManyValidation)
    // 2. database operation
    const response = await deps.deleteManyRepository.handle(input.ids, options)
    return { deletedCount: response.deletedCount }
  }
}
