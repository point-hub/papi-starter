import type { IQuery } from '@point-hub/papi'

import type { IRetrieveExampleOutput } from '../repositories/retrieve.repository'
import type { IRetrieveAllExampleRepository } from '../repositories/retrieve-all.repository'

export interface IInput {
  query: IQuery
}
export interface IDeps {
  retrieveAllRepository: IRetrieveAllExampleRepository
}
export interface IOptions {
  session?: unknown
}
export interface IOutput {
  data: IRetrieveExampleOutput[]
  pagination: {
    page: number
    page_count: number
    page_size: number
    total_document: number
  }
}

export class RetrieveAllExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
    const response = await deps.retrieveAllRepository.handle(input.query, options)
    return {
      data: response.data,
      pagination: response.pagination,
    }
  }
}
