import type { IController, IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';
import { UniqueValidationService } from '@/modules/_shared/services/unique-validation.service';

import { UpdateRepository } from '../repositories/update.repository';
import { updateEmailRules } from '../rules/update-email.rules';
import { UpdateEmailUseCase } from '../use-cases/update-email.use-case';

export const updateEmailController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], updateEmailRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });
    const uniqueValidationService = new UniqueValidationService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updateEmailUseCase = new UpdateEmailUseCase({
      updateRepository,
      uniqueValidationService,
    });

    // Execute business logic
    const response = await updateEmailUseCase.handle({
      filter: { _id: controllerInput.req['params']['id'] },
      data: controllerInput.req['body'],
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
