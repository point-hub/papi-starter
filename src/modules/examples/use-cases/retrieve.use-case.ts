import type { IRetrieveExampleRepository } from '../repositories/retrieve.repository'

export interface IInput {
  _id: string
}

export interface IDeps {
  retrieveExampleRepository: IRetrieveExampleRepository
}

export interface IOutput {
  _id: string
  name: string
  phone: string
  created_date: string
  updated_date: string
}

export class RetrieveExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. database operation
    const response = await deps.retrieveExampleRepository.handle(input._id)
    // 2. output
    return {
      _id: response._id,
      name: response.name,
      phone: response.phone,
      created_date: response.created_date,
      updated_date: response.updated_date,
    }
  }
}
