import type { IController, IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';

import { IdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import { signinRules } from '../rules/signin.rules';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';
import { SigninUseCase } from '../use-cases/signin.use-case';

export const signinController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], signinRules);

    // Initialize repositories and utilities
    const identityMatcherRepository = new IdentityMatcherRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const signinUseCase = new SigninUseCase({
      identityMatcherRepository,
      passwordService: PasswordService,
      tokenService: TokenService,
    });

    // Execute business logic
    const response = await signinUseCase.handle({ data: controllerInput.req['body'] });

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
    controllerInput.res.cookie('papp_starter_access', response.data.access_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes,
    });
    controllerInput.res.cookie('papp_starter_refresh', response.data.refresh_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    controllerInput.res.json(response.data);
  } catch (error) {
    await session?.abortTransaction();
    throw error;
  } finally {
    await session?.endSession();
  }
};
