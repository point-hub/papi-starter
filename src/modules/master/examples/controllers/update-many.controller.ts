import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { UpdateManyExampleRepository } from '../repositories/update-many.repository'
import { UpdateManyExampleUseCase } from '../use-cases/update-many.use-case'

export const updateManyExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const updateManyExampleRepository = new UpdateManyExampleRepository(controllerInput.dbConnection, { session })
    // 3. handle business rules
    const response = await UpdateManyExampleUseCase.handle(
      {
        filter: controllerInput.httpRequest['body'].filter,
        data: controllerInput.httpRequest['body'].data,
      },
      { updateManyExampleRepository, schemaValidation, objClean },
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
