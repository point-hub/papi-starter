import type { IController, IControllerInput } from '@point-hub/papi';

import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';
import { AuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { ResetPasswordRepository } from '../repositories/reset-password.repository';
import { RetrieveRepository } from '../repositories/retrieve.repository';
import { RetrieveManyRepository } from '../repositories/retrieve-many.repository';
import { resetPasswordRules } from '../rules/reset-password.rules';
import { PasswordService } from '../services/password.service';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';

export const resetPasswordController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], resetPasswordRules);

    // Initialize repositories and utilities
    const resetPasswordRepository = new ResetPasswordRepository(controllerInput.dbConnection, { session });
    const retrieveManyRepository = new RetrieveManyRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });
    const auditLogService = new AuditLogService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const resetPasswordUseCase = new ResetPasswordUseCase({
      retrieveManyRepository,
      retrieveRepository,
      resetPasswordRepository,
      auditLogService,
      passwordService: PasswordService,
    });

    // Execute business logic
    const response = await resetPasswordUseCase.handle({
      userAgent: JSON.parse(
        Array.isArray(controllerInput.req.headers['client-user-agent'])
          ? controllerInput.req.headers['client-user-agent'][0]
          : controllerInput.req.headers['client-user-agent'] ?? '{}',
      ),
      ip: controllerInput.req.ip ?? '',
      filter: { code: controllerInput.req['body'].code },
      data: { password: controllerInput.req['body'].password },
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
