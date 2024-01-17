import type { IRetrieveOutput, IRetrieveRepository } from '@point-hub/papi'

export interface IInput {
  _id: string
}
export interface IDeps {
  retrieveRepository: IRetrieveRepository
}
export interface IOptions {}

export class RetrieveExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveOutput> {
    return await deps.retrieveRepository.handle(input._id, options)
  }
}
