import type { IObjClean } from '@point-hub/express-utils'
import type { ISchemaValidation } from '@point-hub/papi'

import type { IUniqueValidation } from '@/utils/unique-validation'

import { collectionName, ExampleEntity } from '../entity'
import type { IExampleNationality } from '../interface'
import type { ICreateExampleRepository } from '../repositories/create.repository'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  age?: number
  nationality?: IExampleNationality
  notes?: string
}

export interface IDeps {
  createExampleRepository: ICreateExampleRepository
  schemaValidation: ISchemaValidation
  uniqueValidation: IUniqueValidation
  objClean: IObjClean
}

export interface IOutput {
  inserted_id: string
}

export class CreateExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate unique
    await deps.uniqueValidation.handle(collectionName, { match: { name: input.name } })
    // 2. validate schema
    await deps.schemaValidation(input, createValidation)
    // 3. define entity
    const exampleEntity = new ExampleEntity({
      name: input.name,
      age: input.age,
      nationality: input.nationality,
      notes: input.notes,
      created_at: new Date(),
    })
    exampleEntity.data = deps.objClean(exampleEntity.data)
    // 4. database operation
    const response = await deps.createExampleRepository.handle(exampleEntity.data)
    // 5. output
    return { inserted_id: response.inserted_id }
  }
}
