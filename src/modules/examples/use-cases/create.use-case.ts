import type { IObjClean } from '@point-hub/express-utils'
import type { ISchemaValidation } from '@point-hub/papi'

import type { IUniqueValidation } from '@/utils/unique-validation'

import { collectionName, ExampleEntity } from '../entity'
import type { ICreateExampleRepository } from '../repositories/create.repository'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  phone?: string
}

export interface IDeps {
  createRepository: ICreateExampleRepository
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
    await deps.uniqueValidation.handle(collectionName, { name: input.name })
    // 2. validate schema
    await deps.schemaValidation(input, createValidation)
    // 3. define entity
    const exampleEntity = new ExampleEntity({
      name: input.name,
      phone: input.phone,
    })
    exampleEntity.generateDate('created_date')
    exampleEntity.data = deps.objClean(exampleEntity.data)
    // 4. database operation
    const response = await deps.createRepository.handle(exampleEntity.data)
    // 5. output
    return { inserted_id: response.inserted_id }
  }
}
