import type { ISchemaValidation } from '@point-hub/papi'

import type { IDeleteManyExampleRepository } from '../repositories/delete-many.repository'
import { deleteManyValidation } from '../validations/delete-many.validation'

export interface IInput {
  ids: string[]
}
export interface IDeps {
  schemaValidation: ISchemaValidation
  deleteManyRepository: IDeleteManyExampleRepository
}
export interface IOptions {
  session?: unknown
}
export interface IOutput {
  deleted_count: number
}

export class DeleteManyExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, deleteManyValidation)
    // 2. database operation
    const response = await deps.deleteManyRepository.handle(input.ids, options)
    return { deleted_count: response.deleted_count }
  }
}
