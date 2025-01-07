import type { IObjClean } from '@point-hub/express-utils'
import type { ISchemaValidation } from '@point-hub/papi'

import type { IUniqueValidation } from '@/utils/unique-validation'

import { collectionName, ExampleEntity } from '../entity'
import type { ICreateManyExampleRepository } from '../repositories/create-many.repository'
import { createManyValidation } from '../validations/create-many.validation'

export interface IInput {
  examples: {
    name?: string
    phone?: string
  }[]
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  createManyExampleRepository: ICreateManyExampleRepository
  uniqueValidation: IUniqueValidation
  objClean: IObjClean
}

export interface IOutput {
  inserted_count: number
  inserted_ids: string[]
}

export class CreateManyExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate schema
    await deps.schemaValidation({ examples: input.examples }, createManyValidation)
    // 2. define entity
    const entities = []
    for (const document of input.examples) {
      // 3. validate unique
      await deps.uniqueValidation.handle(collectionName, { name: document.name })
      const exampleEntity = new ExampleEntity({
        name: document.name,
        phone: document.phone,
      })
      exampleEntity.generateDate('created_date')
      exampleEntity.data = deps.objClean(exampleEntity.data)
      entities.push(exampleEntity.data)
    }
    // 4. database operation
    const response = await deps.createManyExampleRepository.handle(entities)
    // 5. output
    return {
      inserted_ids: response.inserted_ids,
      inserted_count: response.inserted_count,
    }
  }
}
