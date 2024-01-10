import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { UpdateRepository } from '../repositories/update.repository'
import { UpdateExampleUseCase } from '../use-cases/update.use-case'

export const updateExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const repository = new UpdateRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await new UpdateExampleUseCase(repository).handle(
      {
        _id: controllerInput.httpRequest.params.id,
        data: controllerInput.httpRequest.body,
      },
      { cleanObject: objClean, schemaValidation },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 200,
      json: {
        matchedCount: response.matchedCount,
        modifiedCount: response.modifiedCount,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
