import type { IController, IControllerInput } from '@point-hub/papi';

import { EmailService } from '@/modules/_shared/services/email.service';
import { SchemaUniqueValidationService } from '@/modules/_shared/services/schema-validation.service';

import { IdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import { UpdateRepository } from '../repositories/update.repository';
import { sendEmailVerificationRules } from '../rules/send-email-verification.rules';
import { EmailVerificationService } from '../services/email-verification.service';
import { SendEmailVerificationUseCase } from '../use-cases/send-email-verification.use-case';

export const sendEmailVerificationController: IController = async (controllerInput: IControllerInput) => {
  let session;
  try {
    // Start database session for transaction
    session = controllerInput.dbConnection.startSession();
    session.startTransaction();

    // Validate request body against schema
    SchemaUniqueValidationService.validate(controllerInput.req['body'], sendEmailVerificationRules);

    // Initialize repositories and utilities
    const updateRepository = new UpdateRepository(controllerInput.dbConnection, { session });
    const identityMatcherRepository = new IdentityMatcherRepository(controllerInput.dbConnection, { session });

    // Initialize use case with dependencies
    const sendEmailVerificationUseCase = new SendEmailVerificationUseCase({
      identityMatcherRepository,
      updateRepository,
      emailService: EmailService,
      emailVerificationService: EmailVerificationService,
    });

    // Execute business logic
    const response = await sendEmailVerificationUseCase.handle({
      filter: { username: controllerInput.req['body']['username'] },
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
