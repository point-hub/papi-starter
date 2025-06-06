import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { DeleteManyExampleRepository } from '../repositories/delete-many.repository'
import { DeleteManyExampleUseCase } from '../use-cases/delete-many.use-case'

export const deleteManyExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const deleteManyExampleRepository = new DeleteManyExampleRepository(controllerInput.dbConnection, { session })
    // 3. handle business rules
    const response = await DeleteManyExampleUseCase.handle(
      { ids: controllerInput.httpRequest['body'].ids },
      { schemaValidation, deleteManyExampleRepository },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 200,
      json: { deleted_count: response.deleted_count },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
