import type { IController, IControllerInput } from '@point-hub/papi';

import { UpdateLastSeenRepository } from '../repositories/update-last-seen.repository';
import { UpdateLastSeenUseCase } from '../use-cases/update-last-seen.use-case';

export const updateLastSeenController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const updateLastSeenRepository = new UpdateLastSeenRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updateLastSeenUseCase = new UpdateLastSeenUseCase({
      updateLastSeenRepository,
    });

    // Execute business logic
    const response = await updateLastSeenUseCase.handle({
      filter: {
        _id: controllerInput.req['authUser']?._id,
      },
    });

    // Handle failed response
    if (response.status === 'failed') {
      controllerInput.res.status(response.error.code);
      controllerInput.res.statusMessage = response.error.message;
      controllerInput.res.json(response.error);
      return;
    }

    // Commit transaction and send response
    await session.commitTransaction();
    controllerInput.res.status(200);
    controllerInput.res.json(response.data);
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
