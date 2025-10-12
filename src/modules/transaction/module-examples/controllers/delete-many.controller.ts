import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { DeleteManyModuleExampleRepository } from '../repositories/delete-many.repository'
import { DeleteManyModuleExampleUseCase } from '../use-cases/delete-many.use-case'

export const deleteManyModuleExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const deleteManyModuleExampleRepository = new DeleteManyModuleExampleRepository(controllerInput.dbConnection, {
      session,
    })
    // 3. handle business rules
    const response = await DeleteManyModuleExampleUseCase.handle(
      { ids: controllerInput.httpRequest['body'].ids },
      { schemaValidation, deleteManyModuleExampleRepository },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 200,
      json: response,
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
