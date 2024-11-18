import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { UniqueValidation } from '@/utils/unique-validation'
import { schemaValidation } from '@/utils/validation'

import { CreateRepository } from '../repositories/create.repository'
import { CreateManyRepository } from '../repositories/create-many.repository'
import { DeleteRepository } from '../repositories/delete.repository'
import { DeleteManyRepository } from '../repositories/delete-many.repository'
import { UpdateRepository } from '../repositories/update.repository'
import { UpdateManyRepository } from '../repositories/update-many.repository'
import { CreateExampleUseCase } from '../use-cases/create.use-case'
import { CreateManyExampleUseCase } from '../use-cases/create-many.use-case'
import { DeleteExampleUseCase } from '../use-cases/delete.use-case'
import { DeleteManyExampleUseCase } from '../use-cases/delete-many.use-case'
import { UpdateExampleUseCase } from '../use-cases/update.use-case'
import { UpdateManyExampleUseCase } from '../use-cases/update-many.use-case'

export const transactionExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const createRepository = new CreateRepository(controllerInput.dbConnection, { session })
    const createManyRepository = new CreateManyRepository(controllerInput.dbConnection, { session })
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session })
    const updateManyRepository = new UpdateManyRepository(controllerInput.dbConnection, { session })
    const deleteRepository = new DeleteRepository(controllerInput.dbConnection, { session })
    const deleteManyRepository = new DeleteManyRepository(controllerInput.dbConnection, { session })
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection)
    // 3. handle business rules
    const responseCreate = await CreateExampleUseCase.handle(controllerInput.httpRequest.body.new, {
      createRepository,
      schemaValidation,
      uniqueValidation,
      objClean,
    })
    // 3.1. create
    await CreateExampleUseCase.handle(controllerInput.httpRequest.body.create, {
      createRepository,
      schemaValidation,
      uniqueValidation,
      objClean,
    })
    await session.commitTransaction()
    session.startTransaction()
    // 3.2. create many
    const responseCreateMany = await CreateManyExampleUseCase.handle(controllerInput.httpRequest.body.createMany, {
      createManyRepository,
      schemaValidation,
      uniqueValidation,
      objClean,
    })
    await session.commitTransaction()
    session.startTransaction()
    // 3.3. update
    await UpdateExampleUseCase.handle(
      {
        _id: responseCreate.inserted_id,
        data: {
          name: controllerInput.httpRequest.body.update.name,
        },
      },
      {
        uniqueValidation,
        updateRepository,
        schemaValidation,
        objClean,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.4. update many
    await UpdateManyExampleUseCase.handle(
      {
        filter: {
          name: controllerInput.httpRequest.body.updateMany.filter.name,
        },
        data: {
          name: controllerInput.httpRequest.body.updateMany.data.name,
        },
      },
      {
        updateManyRepository,
        schemaValidation,
        objClean,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.5. delete
    await DeleteExampleUseCase.handle(
      { _id: controllerInput.httpRequest.body.delete === true ? responseCreate.inserted_id : '' },
      {
        schemaValidation,
        deleteRepository,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.6. delete many
    await DeleteManyExampleUseCase.handle(
      { ids: controllerInput.httpRequest.body.deleteMany === true ? responseCreateMany.inserted_ids : [''] },
      {
        schemaValidation,
        deleteManyRepository,
      },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 201,
      json: {
        inserted_id: responseCreate.inserted_id,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
