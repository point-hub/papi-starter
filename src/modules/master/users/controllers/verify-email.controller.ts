import { type IController, type IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';
import { AuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { RetrieveRepository } from '../repositories/retrieve.repository';
import { RetrieveManyRepository } from '../repositories/retrieve-many.repository';
import { UserVerifyEmailRepository } from '../repositories/verify-email.repository';
import { verifyEmailRules } from '../rules/verify-email.rules';
import { VerifyEmailUseCase } from '../use-cases/verify-email.use-case';

export const verifyEmailController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], verifyEmailRules);

    // Initialize repositories and utilities
    const verifyEmailRepository = new UserVerifyEmailRepository(controllerInput.dbConnection, { session });
    const retrieveManyRepository = new RetrieveManyRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });
    const auditLogService = new AuditLogService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const verifyEmailUseCase = new VerifyEmailUseCase({
      verifyEmailRepository,
      retrieveManyRepository,
      retrieveRepository,
      auditLogService,
    });

    // Execute business logic
    const response = await verifyEmailUseCase.handle({
      userAgent: JSON.parse(
        Array.isArray(controllerInput.req.headers['client-user-agent'])
          ? controllerInput.req.headers['client-user-agent'][0]
          : controllerInput.req.headers['client-user-agent'] ?? '{}',
      ),
      ip: controllerInput.req.ip ?? '',
      filter: {
        code: controllerInput.req['body']['code'],
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
