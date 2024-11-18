import type { IObjClean } from '@point-hub/express-utils'
import type { IDocument, ISchemaValidation } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import type { IUpdateManyExampleRepository } from '../repositories/update-many.repository'
import { updateManyValidation } from '../validations/update-many.validation'

export interface IInput {
  filter: IDocument
  data: {
    name?: string
    phone?: string
  }
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  updateManyRepository: IUpdateManyExampleRepository
  objClean: IObjClean
}

export interface IOptions {
  session?: unknown
}

export interface IOutput {
  matched_count: number
  modified_count: number
}

export class UpdateManyExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate schema
    await deps.schemaValidation(input.data, updateManyValidation)
    // 2. define entity
    const exampleEntity = new ExampleEntity({
      name: input.data.name,
      phone: input.data.phone,
    })
    exampleEntity.generateDate('updated_date')
    exampleEntity.data = deps.objClean(exampleEntity.data)
    // 3. database operation
    const response = await deps.updateManyRepository.handle(input.filter, exampleEntity.data)
    // 4. output
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
