import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { DeleteModuleExampleRepository } from '../repositories/delete.repository'
import { DeleteModuleExampleUseCase } from '../use-cases/delete.use-case'

export const deleteModuleExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const deleteModuleExampleRepository = new DeleteModuleExampleRepository(controllerInput.dbConnection, { session })
    // 3. handle business logic
    const response = await DeleteModuleExampleUseCase.handle(
      { _id: controllerInput.httpRequest['params'].id },
      { schemaValidation, deleteModuleExampleRepository },
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
