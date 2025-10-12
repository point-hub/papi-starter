import type { IObjClean } from '@point-hub/express-utils'
import type { IDocument, ISchemaValidation } from '@point-hub/papi'

import { ExampleEntity } from '../entity'
import type { IExampleNationality } from '../interface'
import type { IUpdateManyExampleRepository } from '../repositories/update-many.repository'
import { updateManyValidation } from '../validations/update-many.validation'

export interface IInput {
  filter: IDocument
  data: {
    name?: string
    age?: number
    nationality?: IExampleNationality
    notes?: string
  }
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  updateManyExampleRepository: IUpdateManyExampleRepository
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
      age: input.data.age,
      nationality: input.data.nationality,
      notes: input.data.notes,
      updated_at: new Date(),
    })
    exampleEntity.data = deps.objClean(exampleEntity.data)
    // 3. database operation
    const response = await deps.updateManyExampleRepository.handle(input.filter, exampleEntity.data)
    // 4. output
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
