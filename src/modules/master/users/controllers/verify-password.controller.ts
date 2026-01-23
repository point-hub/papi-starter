import type { IController, IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';

import { IdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import { verifyPasswordRules } from '../rules/verify-password.rules';
import { PasswordService } from '../services/password.service';
import { VerifyPasswordUseCase } from '../use-cases/verify-password.use-case';

export const verifyPasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], verifyPasswordRules);

    // Initialize repositories and utilities
    const identityMatcherRepository = new IdentityMatcherRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const signinUseCase = new VerifyPasswordUseCase({
      identityMatcherRepository,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await signinUseCase.handle({
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
