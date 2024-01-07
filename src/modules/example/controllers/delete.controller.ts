import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/validation'

import { DeleteRepository } from '../repositories/delete.repository'
import { DeleteExampleUseCase } from '../use-cases/delete.use-case'

export const deleteExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const repository = new DeleteRepository(controllerInput.dbConnection)
    // 3. handle business logic
    const response = await new DeleteExampleUseCase(repository).handle(
      { _id: controllerInput.httpRequest.params.id },
      { schemaValidation },
      { session },
    )
    await session.commitTransaction()
    // return response to client
    return {
      status: 200,
      json: { deletedCount: response.deletedCount },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
