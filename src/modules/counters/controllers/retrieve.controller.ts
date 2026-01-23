import type { IController, IControllerInput } from '@point-hub/papi';

import { AuthorizationService } from '@/modules/_shared/services/authorization.service';
import { CodeGeneratorService } from '@/modules/counters/services/code-generator.service';

import { RetrieveManyRepository } from '../repositories/retrieve-many.repository';
import { RetrieveUseCase } from '../use-cases/retrieve.use-case';

export const retrieveController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const retrieveManyRepository = new RetrieveManyRepository(controllerInput.dbConnection, { session });
    const codeGeneratorService = new CodeGeneratorService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const retrieveUseCase = new RetrieveUseCase({
      retrieveManyRepository,
      authorizationService: AuthorizationService,
      codeGeneratorService,
    });

    // Execute business logic
    const response = await retrieveUseCase.handle({
      authUser: controllerInput.req['authUser'],
      filter: {
        name: controllerInput.req.query['name'] as string,
        date: controllerInput.req.query['date'] as string,
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
