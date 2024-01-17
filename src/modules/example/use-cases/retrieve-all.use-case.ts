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
    return await deps.retrieveAllRepository.handle(input.query, options)
  }
}
