import type { IController, IControllerInput } from '@point-hub/papi';

import { AuthorizationService } from '@/modules/_shared/services/authorization.service';
import { AblyService } from '@/modules/ably/services/ably.service';
import { AuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { DeleteRepository } from '../repositories/delete.repository';
import { RetrieveRepository } from '../repositories/retrieve.repository';
import { DeleteUseCase } from '../use-cases/delete.use-case';

export const deleteController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Initialize repositories and utilities
    const deleteRepository = new DeleteRepository(controllerInput.dbConnection, { session });
    const retrieveRepository = new RetrieveRepository(controllerInput.dbConnection, { session });
    const auditLogService = new AuditLogService(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const deleteUseCase = new DeleteUseCase({
      deleteRepository,
      retrieveRepository,
      ablyService: AblyService,
      auditLogService,
      authorizationService: AuthorizationService,
    });

    // Execute business logic
    const response = await deleteUseCase.handle({
      authUser: controllerInput.req['authUser'],
      userAgent: JSON.parse(
        Array.isArray(controllerInput.req.headers['client-user-agent'])
          ? controllerInput.req.headers['client-user-agent'][0]
          : controllerInput.req.headers['client-user-agent'] ?? '{}',
      ),
      ip: controllerInput.req.ip ?? '',
      filter: {
        _id: controllerInput.req['params']['id'],
      },
      data: {
        delete_reason: controllerInput.req['body']?.['delete_reason'],
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
