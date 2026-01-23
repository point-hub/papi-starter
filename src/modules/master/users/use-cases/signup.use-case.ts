import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IEmailService } from '@/modules/_shared/services/email.service';
import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';
import type { IRetrieveManyRepository as IRoleRetrieveManyRepository } from '@/modules/master/roles/repositories/retrieve-many.repository';

import { collectionName, UserEntity } from '../entity';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { ISignupRepository } from '../repositories/signup.repository';
import type { IEmailVerificationService } from '../services/email-verification.service';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  userAgent: IUserAgent
  ip: string
  data: {
    name: string
    username: string
    email: string
    password: string
  }
}

export interface IDeps {
  signupRepository: ISignupRepository
  retrieveRepository: IRetrieveRepository
  roleRetrieveManyRepository: IRoleRetrieveManyRepository
  auditLogService: IAuditLogService
  uniqueValidationService: IUniqueValidationService
  emailService: IEmailService
  emailVerificationService: IEmailVerificationService
  passwordService: IPasswordService
}

export interface ISuccessData {
  inserted_id: string
  user: {
    _id: string
    name: string
    username: string
    email: string
  }
}

/**
 * Use case: Signup user.
 *
 * Responsibilities:
 * - Generate an email verification link and code.
 * - Transform input data.
 * - Validate uniqueness for email and username.
 * - Save the data to the database.
 * - Send the email verification message to the user.
 * - Retrieve user data after insertion.
 * - Return a success response.
 */
export class SignupUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Generate an email verification link and code.
    const linkEmailVerification = this.deps.emailVerificationService.generate();

    // Get default role.
    const responseRoles = await this.deps.roleRetrieveManyRepository.handle();
    if (!responseRoles) {
      if (!responseRoles) return this.fail({
        code: 404,
        message: 'The requested role does not exist.',
      });
    }

    // Transform input data.
    const userEntity = new UserEntity({
      role_id: responseRoles.data[0]._id, // default role
      name: input.data.name,
      username: input.data.username,
      email: input.data.email,
      password: input.data.password ? await this.deps.passwordService.hash(input.data.password) : '',
      email_verification: {
        is_verified: false,
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
      created_at: new Date(),
    });
    userEntity.trimmedEmail();
    userEntity.trimmedUsername();

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
    const responseSignup = await this.deps.signupRepository.handle(userEntity.data);

    // Send the email verification message to the user.
    await this.deps.emailService.send(
      {
        to: userEntity.data.email as string,
        subject: 'Please verify your email address',
        template: 'modules/master/users/emails/email-verification.hbs',
        context: {
          code: linkEmailVerification.code,
          url: linkEmailVerification.url,
        },
      },
    );

    // Retrieve user data after insertion.
    const responseUser = await this.deps.retrieveRepository.handle(responseSignup.inserted_id);
    if (!responseUser) {
      if (!responseUser) return this.fail({
        code: 404,
        message: 'The requested data does not exist.',
      });
    }

    // Create an audit log entry for this operation.
    const changes = this.deps.auditLogService.buildChanges({}, userEntity.data, { redactFields: ['password'] });
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: responseUser._id,
      entity_ref: `${input.data.username}`,
      actor_type: 'anonymous',
      action: 'signup',
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

    // Return a success response.
    return this.success({
      inserted_id: responseSignup.inserted_id,
      user: {
        _id: responseSignup.inserted_id,
        name: responseUser.name,
        username: responseUser.username,
        email: responseUser.email,
      },
    });
  }
}
