import type { IController, IControllerInput } from '@point-hub/papi';

import { RetrieveManyRepository } from '../repositories/retrieve-many.repository';
import { RetrieveManyUseCase } from '../use-cases/retrieve-many.use-case';

export const retrieveManyController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const retrieveManyRepository = new RetrieveManyRepository(controllerInput.dbConnection);

    // Initialize use case with dependencies
    const retrieveManyUseCase = new RetrieveManyUseCase({ retrieveManyRepository });

    // Execute business logic
    const response = await retrieveManyUseCase.handle({ query: controllerInput.req['query'] });

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
