import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { UniqueValidation } from '@/utils/unique-validation'
import { schemaValidation } from '@/utils/validation'

import { CreateManyModuleExampleRepository } from '../repositories/create-many.repository'
import { CreateManyModuleExampleUseCase } from '../use-cases/create-many.use-case'

export const createManyModuleExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const createManyModuleExampleRepository = new CreateManyModuleExampleRepository(controllerInput.dbConnection, {
      session,
    })
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await CreateManyModuleExampleUseCase.handle(controllerInput.httpRequest['body'], {
      schemaValidation,
      createManyModuleExampleRepository,
      uniqueValidation,
      objClean,
    })
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 201,
      json: response,
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
