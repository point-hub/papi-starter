import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { UniqueValidation } from '@/utils/unique-validation'
import { schemaValidation } from '@/utils/validation'

import { CreateModuleExampleRepository } from '../repositories/create.repository'
import { CreateManyModuleExampleRepository } from '../repositories/create-many.repository'
import { DeleteModuleExampleRepository } from '../repositories/delete.repository'
import { DeleteManyModuleExampleRepository } from '../repositories/delete-many.repository'
import { UpdateModuleExampleRepository } from '../repositories/update.repository'
import { UpdateManyModuleExampleRepository } from '../repositories/update-many.repository'
import { CreateModuleExampleUseCase } from '../use-cases/create.use-case'
import { CreateManyModuleExampleUseCase } from '../use-cases/create-many.use-case'
import { DeleteModuleExampleUseCase } from '../use-cases/delete.use-case'
import { DeleteManyModuleExampleUseCase } from '../use-cases/delete-many.use-case'
import { UpdateModuleExampleUseCase } from '../use-cases/update.use-case'
import { UpdateManyModuleExampleUseCase } from '../use-cases/update-many.use-case'

export const transactionModuleExampleController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const createModuleExampleRepository = new CreateModuleExampleRepository(controllerInput.dbConnection, { session })
    const createManyModuleExampleRepository = new CreateManyModuleExampleRepository(controllerInput.dbConnection, {
      session,
    })
    const updateModuleExampleRepository = new UpdateModuleExampleRepository(controllerInput.dbConnection, { session })
    const updateManyModuleExampleRepository = new UpdateManyModuleExampleRepository(controllerInput.dbConnection, {
      session,
    })
    const deleteModuleExampleRepository = new DeleteModuleExampleRepository(controllerInput.dbConnection, { session })
    const deleteManyModuleExampleRepository = new DeleteManyModuleExampleRepository(controllerInput.dbConnection, {
      session,
    })
    const uniqueValidation = new UniqueValidation(controllerInput.dbConnection)
    // 3. handle business rules
    const responseCreate = await CreateModuleExampleUseCase.handle(controllerInput.httpRequest['body'].new, {
      createModuleExampleRepository,
      schemaValidation,
      uniqueValidation,
      objClean,
    })
    // 3.1. create
    await CreateModuleExampleUseCase.handle(controllerInput.httpRequest['body'].create, {
      createModuleExampleRepository,
      schemaValidation,
      uniqueValidation,
      objClean,
    })
    await session.commitTransaction()
    session.startTransaction()
    // 3.2. create many
    const responseCreateMany = await CreateManyModuleExampleUseCase.handle(
      controllerInput.httpRequest['body'].createMany,
      {
        createManyModuleExampleRepository,
        schemaValidation,
        uniqueValidation,
        objClean,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.3. update
    await UpdateModuleExampleUseCase.handle(
      {
        _id: responseCreate.inserted_id,
        data: {
          name: controllerInput.httpRequest['body'].update.name,
        },
      },
      {
        uniqueValidation,
        updateModuleExampleRepository,
        schemaValidation,
        objClean,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.4. update many
    await UpdateManyModuleExampleUseCase.handle(
      {
        filter: {
          name: controllerInput.httpRequest['body'].updateMany.filter.name,
        },
        data: {
          name: controllerInput.httpRequest['body'].updateMany.data.name,
        },
      },
      {
        updateManyModuleExampleRepository,
        schemaValidation,
        objClean,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.5. delete
    await DeleteModuleExampleUseCase.handle(
      { _id: controllerInput.httpRequest['body'].delete === true ? responseCreate.inserted_id : '' },
      {
        schemaValidation,
        deleteModuleExampleRepository,
      },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.6. delete many
    await DeleteManyModuleExampleUseCase.handle(
      { ids: controllerInput.httpRequest['body'].deleteMany === true ? responseCreateMany.inserted_ids : [''] },
      {
        schemaValidation,
        deleteManyModuleExampleRepository,
      },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 201,
      json: responseCreate,
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
