import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/validation'

import { UpdateManyRepository } from '../repositories/update-many.repository'
import { UpdateManyExampleUseCase } from '../use-cases/update-many.use-case'

export const updateManyExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const repository = new UpdateManyRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await new UpdateManyExampleUseCase(repository).handle(
      {
        filter: controllerInput.httpRequest.body.filter,
        data: controllerInput.httpRequest.body.data,
      },
      {
        cleanObject: objClean,
        schemaValidation,
      },
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
