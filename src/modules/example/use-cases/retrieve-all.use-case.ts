import type { IQuery, IRetrieveAllOutput, IRetrieveAllRepository, IUseCase } from '@point-hub/papi'

export interface IInput {
  query: IQuery
}
export interface IDeps {}
export interface IOptions {}

export class RetrieveAllExampleUseCase implements IUseCase<IInput, IDeps, IOptions, IRetrieveAllOutput> {
  constructor(public repository: IRetrieveAllRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveAllOutput> {
    return await this.repository.handle(input.query, options)
  }
}
