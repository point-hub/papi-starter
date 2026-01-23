import type { IController, IControllerInput } from '@point-hub/papi';

import { AuthorizationService } from '@/modules/_shared/services/authorization.service';

import { FieldsSummaryRepository } from '../repositories/fields-summary.repository';
import { FieldsSummaryUseCase } from '../use-cases/fields-summary.use-case';

export const fieldsSummaryController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const fieldsSummaryRepository = new FieldsSummaryRepository(controllerInput.dbConnection);

    // Initialize use case with dependencies
    const fieldsSummaryUseCase = new FieldsSummaryUseCase({
      fieldsSummaryRepository,
      authorizationService: AuthorizationService,
    });

    // Execute business logic
    const response = await fieldsSummaryUseCase.handle({
      authUser: controllerInput.req['authUser'],
      query: controllerInput.req['query'],
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
