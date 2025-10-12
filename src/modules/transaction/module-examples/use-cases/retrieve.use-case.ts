import type { IModuleExampleNationality } from '../interface'
import type { IRetrieveModuleExampleRepository } from '../repositories/retrieve.repository'

export interface IInput {
  _id: string
}

export interface IDeps {
  retrieveModuleExampleRepository: IRetrieveModuleExampleRepository
}

export interface IOutput {
  _id: string
  name: string
  age: number
  nationality: IModuleExampleNationality
  notes: string
  created_at: Date
  updated_at: Date
}

export class RetrieveModuleExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. database operation
    const response = await deps.retrieveModuleExampleRepository.handle(input._id)
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
