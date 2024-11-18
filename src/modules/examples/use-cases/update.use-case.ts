import type { IObjClean } from '@point-hub/express-utils'
import type { ISchemaValidation } from '@point-hub/papi'

import { IUniqueValidation } from '@/utils/unique-validation'

import { collectionName, ExampleEntity } from '../entity'
import type { IUpdateExampleRepository } from '../repositories/update.repository'
import { updateValidation } from '../validations/update.validation'

export interface IInput {
  _id: string
  data: {
    name?: string
    phone?: string
  }
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  updateRepository: IUpdateExampleRepository
  uniqueValidation: IUniqueValidation
  objClean: IObjClean
}

export interface IOutput {
  matched_count: number
  modified_count: number
}

export class UpdateExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate unique
    await deps.uniqueValidation.handle(collectionName, { name: input.data.name }, input._id)
    // 2. validate schema
    await deps.schemaValidation(input.data, updateValidation)
    // 3. define entity
    const exampleEntity = new ExampleEntity({
      name: input.data.name,
      phone: input.data.phone,
    })
    exampleEntity.generateDate('updated_date')
    exampleEntity.data = deps.objClean(exampleEntity.data)
    // 4. database operation
    const response = await deps.updateRepository.handle(input._id, exampleEntity.data)
    // 5. output
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
