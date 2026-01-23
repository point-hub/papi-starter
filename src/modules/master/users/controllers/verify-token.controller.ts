import { type IController, type IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';

import { RetrieveRepository } from '../repositories/retrieve.repository';
import { verifyTokenRules } from '../rules/verify-token.rules';
import { TokenService } from '../services/token.service';
import { VerifyTokenUseCase } from '../use-cases/verify-token.use-case';

export const verifyTokenController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], verifyTokenRules);

    // Initialize repositories and utilities
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const verifyTokenUseCase = new VerifyTokenUseCase({
      retrieveRepository,
      tokenService: TokenService,
    });

    // Execute business logic
    const response = await verifyTokenUseCase.handle({
      data: {
        token: controllerInput.req['cookies']['papp_starter_access'],
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
