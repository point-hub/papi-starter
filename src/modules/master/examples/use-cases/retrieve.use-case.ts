import type { IExampleNationality } from '../interface'
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
  age: number
  nationality: IExampleNationality
  notes: string
  created_at: Date
  updated_at: Date
}

export class RetrieveExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. database operation
    const response = await deps.retrieveExampleRepository.handle(input._id)
    // 2. output
    return {
      _id: response._id,
      name: response.name,
      age: response.age,
      nationality: response.nationality,
      notes: response.notes,
      created_at: response.created_at,
      updated_at: response.updated_at,
    }
  }
}
