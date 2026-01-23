import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IEmailService } from '@/modules/_shared/services/email.service';
import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName, UserEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';
import type { IEmailVerificationService } from '../services/email-verification.service';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  authUser: IAuthUser
  userAgent: IUserAgent
  ip: string
  data: {
    username: string
    name: string
    email: string
    role_id: string
    notes: string
    password: string
    permissions: string[]
  }
}

export interface IDeps {
  createRepository: ICreateRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  authorizationService: IAuthorizationService
  uniqueValidationService: IUniqueValidationService
  emailService: IEmailService
  emailVerificationService: IEmailVerificationService
  passwordService: IPasswordService
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Create User.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action.
 * - Normalizes data (trim).
 * - Validate uniqueness: single unique code field.
 * - Validate uniqueness: single unique name field.
 * - Save the data to the database.
 * - Increment the code counter.
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Return a success response.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'users:create');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Generate an email verification link and code.
    const linkEmailVerification = this.deps.emailVerificationService.generate();

    // Normalizes data (trim).
    const userEntity = new UserEntity({
      username: input.data.username,
      name: input.data.name,
      email: input.data.email,
      notes: input.data.notes,
      password: await this.deps.passwordService.hash(input.data.password),
      role_id: input.data.role_id,
      email_verification: {
        is_verified: false,
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
      created_at: new Date(),
      created_by_id: input.authUser._id,
    });
    userEntity.trimmedUsername();
    userEntity.trimmedEmail();

    // Validate uniqueness: single unique name field.
    const uniqueNameErrors = await this.deps.uniqueValidationService.validate(collectionName, { name: input.data.name });
    if (uniqueNameErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueNameErrors });
    }

    // Validate uniqueness: single unique username field.
    const uniqueUsernameErrors = await this.deps.uniqueValidationService.validate(
      collectionName,
      { trimmed_username: userEntity.data.trimmed_username },
      { replaceErrorAttribute: { trimmed_username: 'username' } },
    );
    if (uniqueUsernameErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueUsernameErrors });
    }

    // Validate uniqueness: single unique name field.
    const uniqueEmailErrors = await this.deps.uniqueValidationService.validate(
      collectionName,
      { trimmed_email: userEntity.data.trimmed_email },
      { replaceErrorAttribute: { trimmed_email: 'email' } },
    );
    if (uniqueEmailErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueEmailErrors });
    }

    // Save the data to the database.
    const createResponse = await this.deps.createRepository.handle(userEntity.data);

    // Create an audit log entry for this operation.
    const changes = this.deps.auditLogService.buildChanges({}, userEntity.data, { redactFields: ['password'] });

    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: createResponse.inserted_id,
      entity_ref: `${input.data.username}`,
      actor_type: 'user',
      actor_id: input.authUser._id,
      actor_name: input.authUser.username,
      action: 'create',
      module: 'user',
      system_reason: 'insert data',
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
        users: createResponse.inserted_id,
      },
      data: dataLog,
    });

    // Return a success response.
    return this.success({
      inserted_id: createResponse.inserted_id,
    });
  }
}
