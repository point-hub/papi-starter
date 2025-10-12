import type { IPagination, IQuery } from '@point-hub/papi'

import type { IRetrieveModuleExampleOutput } from '../repositories/retrieve.repository'
import type { IRetrieveAllModuleExampleRepository } from '../repositories/retrieve-all.repository'

export interface IInput {
  query: IQuery
}

export interface IDeps {
  retrieveAllModuleExampleRepository: IRetrieveAllModuleExampleRepository
}

export interface IOutput {
  data: IRetrieveModuleExampleOutput[]
  pagination: IPagination
}

export class RetrieveAllModuleExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. database operation
    const response = await deps.retrieveAllModuleExampleRepository.handle(input.query)
    // 2. output
    return {
      data: response.data,
      pagination: response.pagination,
    }
  }
}
