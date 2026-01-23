import { type IController, type IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';

import { IsUsernameExistsRepository } from '../repositories/is-username-exists.repository';
import { isUsernameExistsRules } from '../rules/is-username-exists.rules';
import { IsUsernameExistsUseCase } from '../use-cases/is-username-exists.use-case';

export const isUsernameExistsController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], isUsernameExistsRules);

    // Initialize repositories and utilities
    const isUsernameExistsRepository = new IsUsernameExistsRepository(controllerInput.dbConnection, {
      session,
    });

    // Initialize use case with dependencies
    const isUsernameExistsUseCase = new IsUsernameExistsUseCase({
      isUsernameExistsRepository,
    });

    // Execute business logic
    const response = await isUsernameExistsUseCase.handle(controllerInput.req['body']);

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
