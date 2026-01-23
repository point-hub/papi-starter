import type { IController, IControllerInput } from '@point-hub/papi';

import { RetrieveRepository } from '../repositories/retrieve.repository';
import { RetrieveUseCase } from '../use-cases/retrieve.use-case';

export const retrieveController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection);

    // Initialize use case with dependencies
    const retrieveUseCase = new RetrieveUseCase({ retrieveRepository });

    // Execute business logic
    const response = await retrieveUseCase.handle({ _id: controllerInput.req['params']['id'] });

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
