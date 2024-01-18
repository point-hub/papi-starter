import type { IQuery, IRetrieveAllOutput, IRetrieveAllRepository } from '@point-hub/papi'

export interface IInput {
  query: IQuery
}
export interface IDeps {
  retrieveAllRepository: IRetrieveAllRepository
}
export interface IOptions {}

export class RetrieveAllExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveAllOutput> {
    const response = await deps.retrieveAllRepository.handle(input.query, options)
    return {
      data: response.data,
      pagination: response.pagination,
    }
  }
}
