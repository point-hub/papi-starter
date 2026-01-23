import type { IController, IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';
import { UniqueValidationService } from '@/modules/_shared/services/unique-validation.service';

import { RetrieveRepository } from '../repositories/retrieve.repository';
import { UpdateRepository } from '../repositories/update.repository';
import { updatePasswordRules } from '../rules/update-password.rules';
import { PasswordService } from '../services/password.service';
import { UpdatePasswordUseCase } from '../use-cases/update-password.use-case';

export const updatePasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], updatePasswordRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });
    const uniqueValidationService = new UniqueValidationService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const updatePasswordUseCase = new UpdatePasswordUseCase({
      updateRepository,
      retrieveRepository,
      uniqueValidationService,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await updatePasswordUseCase.handle({
      filter: { _id: controllerInput.req['params']['id'] },
      authUser: controllerInput.req['authUser'],
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
