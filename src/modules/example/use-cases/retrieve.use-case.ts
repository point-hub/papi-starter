import type { IRetrieveOutput, IRetrieveRepository, IUseCase } from '@point-hub/papi'

export interface IInput {
  _id: string
}
export interface IDeps {}
export interface IOptions {}

export class RetrieveExampleUseCase implements IUseCase<IInput, IDeps, IOptions, IRetrieveOutput> {
  constructor(public repository: IRetrieveRepository) {}

  async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveOutput> {
    return await this.repository.handle(input._id, options)
  }
}
