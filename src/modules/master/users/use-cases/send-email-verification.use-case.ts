import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IEmailService } from '@/modules/_shared/services/email.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { collectionName, redactFields, UserEntity } from '../entity';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IEmailVerificationService } from '../services/email-verification.service';

export interface IInput {
  ip: string
  userAgent: IUserAgent
  filter: {
    username: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  retrieveRepository: IRetrieveRepository
  updateRepository: IUpdateRepository
  auditLogService: IAuditLogService
  emailService: IEmailService
  emailVerificationService: IEmailVerificationService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Send an email verification link to the user.
 *
 * Responsibilities:
 * - Retrieve the user by email.
 * - Generate a new email verification link and code.
 * - Normalizes data (trim).
 * - Update the user's record with the verification data.
 * - Create an audit log entry for this operation.
 * - Send an email containing the verification link and code.
 * - Return a success response.
 */
export class SendEmailVerificationUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Retrieve the user by email.
    const users = await this.deps.identityMatcherRepository.handle(input.filter.username);
    if (!users || users.data.length === 0) {
      return this.fail({ code: 422, message: 'Email is invalid', errors: { email: ['Email is invalid'] } });
    }

    // Generate a new email verification link and code.
    const linkEmailVerification = this.deps.emailVerificationService.generate();

    // Normalizes data (trim).
    const userEntity = new UserEntity({
      email_verification: {
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
    });

    // Check if the record exists
    const retrieveResponse = await this.deps.retrieveRepository.raw(users.data[0]._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Update the user's record with the verification data.
    const response = await this.deps.updateRepository.handle(users.data[0]._id, userEntity.data);

    // Create an audit log entry for this operation.
    const changes = this.deps.auditLogService.buildChanges(retrieveResponse, userEntity.data, { redactFields });
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: retrieveResponse._id!,
      entity_ref: `${retrieveResponse.username}`,
      actor_type: 'anonymous',
      action: 'send-email-verification',
      module: 'users',
      system_reason: 'generate email verification code',
      changes: changes,
      metadata: {
        ip: input.ip,
        device: input.userAgent.device,
        browser: input.userAgent.browser,
        os: input.userAgent.os,
      },
      created_at: new Date(),
    };
    await this.deps.auditLogService.log(dataLog);

    // Send an email containing the verification link and code.
    await this.deps.emailService.send(
      {
        to: users.data[0].email as string,
        subject: 'Please verify your email address',
        template: 'modules/master/users/emails/email-verification.hbs',
        context: {
          url: linkEmailVerification.url,
          code: linkEmailVerification.code,
        },
      },
    );

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
