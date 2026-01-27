import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IEmailService } from '@/modules/_shared/services/email.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { collectionName, redactFields, UserEntity } from '../entity';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IResetPasswordService } from '../services/reset-password.service';

export interface IInput {
  ip: string
  userAgent: IUserAgent
  data: {
    email: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  retrieveRepository: IRetrieveRepository
  updateRepository: IUpdateRepository
  auditLogService: IAuditLogService
  resetPasswordService: IResetPasswordService
  emailService: IEmailService
}

/**
 * Use case: Handle a user's password reset request.
 *
 * Responsibilities:
 * - Generate a secure reset password link.
 * - Transform and normalize the provided input.
 * - Check whether the user exists in the system.
 * - Check if the record exists.
 * - Reject update when no fields have changed.
 * - Update the user record with reset-related information.
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Send a reset password email to the user.
 * - Return a success response.
 */
export class RequestPasswordUseCase extends BaseUseCase<IInput, IDeps, void> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<void> | IUseCaseOutputFailed> {
    // Generate a secure reset password link.
    const linkResetPassword = this.deps.resetPasswordService.generate();

    // Transform and normalize the provided input.
    const userEntity = new UserEntity({
      email: input.data.email,
      request_password: {
        requested_at: new Date(),
        code: linkResetPassword.code,
        url: linkResetPassword.url,
      },
    });
    userEntity.trimmedEmail();

    // Check whether the user exists in the system.
    const users = await this.deps.identityMatcherRepository.handle(userEntity.data.trimmed_email as string);
    if (!users || users.data.length === 0) {
      return this.fail({ code: 422, message: 'Invalid Credentials', errors: { email: ['Email is invalid'] } });
    }

    // Check if the record exists.
    const retrieveResponse = await this.deps.retrieveRepository.raw(users.data[0]._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Reject update when no fields have changed.
    const changes = this.deps.auditLogService.buildChanges(
      retrieveResponse,
      this.deps.auditLogService.mergeDefined(retrieveResponse, userEntity.data),
      { redactFields },
    );
    if (changes.summary.fields?.length === 0) {
      return this.fail({ code: 400, message: 'No changes detected. Please modify at least one field before saving.' });
    }

    // Update the user record with reset-related information.
    await this.deps.updateRepository.handle(users.data[0]._id, userEntity.data);

    // Create an audit log entry for this operation.
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: retrieveResponse._id!,
      entity_ref: retrieveResponse.username!,
      actor_type: 'anonymous',
      action: 'request-password',
      module: 'users',
      system_reason: 'update data',
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

    // Send a reset password email to the user.
    await this.deps.emailService.send({
      to: userEntity.data.email as string,
      subject: 'Request reset password',
      template: 'modules/master/users/emails/request-password.hbs',
      context: {
        name: users.data[0].name,
        code: linkResetPassword.code,
        url: linkResetPassword.url,
      },
    });

    // Return a success response.
    return this.success();
  }
}
