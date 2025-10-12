import type { IObjClean } from '@point-hub/express-utils'
import type { IDocument, ISchemaValidation } from '@point-hub/papi'

import { ModuleExampleEntity } from '../entity'
import type { IModuleExampleNationality } from '../interface'
import type { IUpdateManyModuleExampleRepository } from '../repositories/update-many.repository'
import { updateManyValidation } from '../validations/update-many.validation'

export interface IInput {
  filter: IDocument
  data: {
    name?: string
    age?: number
    nationality?: IModuleExampleNationality
    notes?: string
  }
}

export interface IDeps {
  schemaValidation: ISchemaValidation
  updateManyModuleExampleRepository: IUpdateManyModuleExampleRepository
  objClean: IObjClean
}

export interface IOptions {
  session?: unknown
}

export interface IOutput {
  matched_count: number
  modified_count: number
}

export class UpdateManyModuleExampleUseCase {
  static async handle(input: IInput, deps: IDeps): Promise<IOutput> {
    // 1. validate schema
    await deps.schemaValidation(input.data, updateManyValidation)
    // 2. define entity
    const moduleExampleEntity = new ModuleExampleEntity({
      name: input.data.name,
      age: input.data.age,
      nationality: input.data.nationality,
      notes: input.data.notes,
      updated_at: new Date(),
    })
    moduleExampleEntity.data = deps.objClean(moduleExampleEntity.data)
    // 3. database operation
    const response = await deps.updateManyModuleExampleRepository.handle(input.filter, moduleExampleEntity.data)
    // 4. output
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
