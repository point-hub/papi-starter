import type { IObjClean } from '@point-hub/express-utils'
import type { ISchemaValidation } from '@point-hub/papi'

import type { IUniqueValidation } from '@/utils/unique-validation'

import { collectionName, ModuleExampleEntity } from '../entity'
import type { IModuleExampleNationality } from '../interface'
import type { ICreateModuleExampleRepository } from '../repositories/create.repository'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  age?: number
  nationality?: IModuleExampleNationality
  notes?: string
}

export interface IDeps {
  createModuleExampleRepository: ICreateModuleExampleRepository
  schemaValidation: ISchemaValidation
  uniqueValidation: IUniqueValidation
  objClean: IObjClean
}

export interface IOutput {
  inserted_id: string
}

export class CreateModuleExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate unique
    await deps.uniqueValidation.handle(collectionName, { match: input })
    // 2. validate schema
    await deps.schemaValidation(input, createValidation)
    // 3. define entity
    const moduleExampleEntity = new ModuleExampleEntity({
      name: input.name,
      age: input.age,
      nationality: input.nationality,
      notes: input.notes,
      created_at: new Date(),
    })
    moduleExampleEntity.data = deps.objClean(moduleExampleEntity.data)
    // 4. database operation
    const response = await deps.createModuleExampleRepository.handle(moduleExampleEntity.data)
    // 5. output
    return { inserted_id: response.inserted_id }
  }
}
