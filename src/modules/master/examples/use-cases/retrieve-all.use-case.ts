import type { IPagination, IQuery } from '@point-hub/papi'

import type { IRetrieveExampleOutput } from '../repositories/retrieve.repository'
import type { IRetrieveAllExampleRepository } from '../repositories/retrieve-all.repository'

export interface IInput {
  query: IQuery
}

export interface IDeps {
  retrieveAllExampleRepository: IRetrieveAllExampleRepository
}

export interface IOutput {
  data: IRetrieveExampleOutput[]
  pagination: IPagination
}

export class RetrieveAllExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. database operation
    const response = await deps.retrieveAllExampleRepository.handle(input.query)
    // 2. output
    return {
      data: response.data,
      pagination: response.pagination,
    }
  }
}
