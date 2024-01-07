import type { IController, IControllerInput } from '@point-hub/papi'

import { RetrieveRepository } from '../repositories/retrieve.repository'
import { RetrieveExampleUseCase } from '../use-cases/retrieve.use-case'

export const retrieveExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const repository = new RetrieveRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await new RetrieveExampleUseCase(repository).handle(
      { _id: controllerInput.httpRequest.params.id },
      {},
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
