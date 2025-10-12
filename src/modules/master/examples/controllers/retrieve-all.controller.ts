import type { IController, IControllerInput } from '@point-hub/papi'

import { RetrieveAllExampleRepository } from '../repositories/retrieve-all.repository'
import { RetrieveAllExampleUseCase } from '../use-cases/retrieve-all.use-case'

export const retrieveAllExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const retrieveAllExampleRepository = new RetrieveAllExampleRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await RetrieveAllExampleUseCase.handle(
      { query: controllerInput.httpRequest['query'] },
      { retrieveAllExampleRepository },
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
