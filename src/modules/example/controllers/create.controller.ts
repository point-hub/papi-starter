import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/validation'

import { CreateRepository } from '../repositories/create.repository'
import { CreateExampleUseCase } from '../use-cases/create.use-case'

export const createExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const repository = new CreateRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await new CreateExampleUseCase(repository).handle(
      controllerInput.httpRequest.body,
      {
        cleanObject: objClean,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 201,
      json: {
        insertedId: response.insertedId,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
