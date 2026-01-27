import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IEmailService } from '@/modules/_shared/services/email.service';
import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { collectionName, UserEntity } from '../entity';
import type { IAuthUser } from '../interface';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IEmailVerificationService } from '../services/email-verification.service';

export interface IInput {
  ip: string
  authUser: IAuthUser
  userAgent: IUserAgent
  filter: {
    _id: string
  }
  data: {
    email?: string
  }
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  updateRepository: IUpdateRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  emailService: IEmailService
  emailVerificationService: IEmailVerificationService
  uniqueValidationService: IUniqueValidationService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's email address.
 *
 * Responsibilities:
 * - Generate an email verification link and code.
 * - Transform input data.
 * - Validate email uniqueness across all users.
 * - Check if the record exists
 * - Reject update when no fields have changed
 * - Save to the database
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Return a success response.
 */
export class UpdateEmailUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Generate an email verification link and code.
    const linkEmailVerification = this.deps.emailVerificationService.generate(true);

    // Transform input data.
    const userEntity = new UserEntity({
      new_email: input.data.email,
      new_email_verification: {
        is_verified: false,
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
    });
    userEntity.trimmedNewEmail();

    // Validate email uniqueness across all users.
    const uniqueEmailErrors = await this.deps.uniqueValidationService.validate(
      collectionName,
      { trimmed_email: userEntity.data.trimmed_new_email },
      { replaceErrorAttribute: { trimmed_email: 'email' } },
    );
    if (uniqueEmailErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueEmailErrors });
    }

    // Check if the record exists
    const retrieveResponse = await this.deps.retrieveRepository.raw(input.filter._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Reject update when no fields have changed
    const changes = this.deps.auditLogService.buildChanges(
      retrieveResponse,
      this.deps.auditLogService.mergeDefined(retrieveResponse, userEntity.data),
    );
    if (changes.summary.fields?.length === 0) {
      return this.fail({ code: 400, message: 'No changes detected. Please modify at least one field before saving.' });
    }

    // Save to the database
    const response = await this.deps.updateRepository.handle(input.filter._id, userEntity.data);

    // Create an audit log entry for this operation.
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: input.filter._id,
      entity_ref: retrieveResponse.username!,
      actor_type: 'user',
      actor_id: input.authUser._id,
      actor_name: input.authUser.username,
      action: 'update-email',
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

    // Publish realtime notification event to the recipient’s channel.
    this.deps.ablyService.publish(`notifications:${input.authUser._id}`, 'logs:new', {
      type: 'users',
      actor_id: input.authUser._id,
      recipient_id: input.authUser._id,
      is_read: false,
      created_at: new Date(),
      entities: {
        roles: input.filter._id,
      },
      data: dataLog,
    });

    // Send the email verification message to the user.
    await this.deps.emailService.send(
      {
        to: input.data.email as string,
        subject: 'Please verify your email address',
        template: 'modules/master/users/emails/new-email-verification.hbs',
        context: {
          code: linkEmailVerification.code,
          url: linkEmailVerification.url,
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
