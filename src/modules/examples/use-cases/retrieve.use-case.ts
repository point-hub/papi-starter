import type { IRetrieveExampleRepository } from '../repositories/retrieve.repository'

export interface IInput {
  _id: string
}
export interface IDeps {
  retrieveRepository: IRetrieveExampleRepository
}
export interface IOptions {
  session?: unknown
}
export interface IOutput {
  _id: string
  name: string
  phone: string
  created_date: string
  updated_date: string
}

export class RetrieveExampleUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
    const response = await deps.retrieveRepository.handle(input._id, options)
    return {
      _id: response._id,
      name: response.name,
      phone: response.phone,
      created_date: response.created_date,
      updated_date: response.updated_date,
    }
  }
}
