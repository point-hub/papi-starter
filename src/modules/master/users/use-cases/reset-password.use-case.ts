import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { collectionName, redactFields, UserEntity } from '../entity';
import type { IResetPasswordRepository } from '../repositories/reset-password.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IRetrieveManyRepository } from '../repositories/retrieve-many.repository';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  userAgent: IUserAgent
  ip: string
  filter: {
    code: string
  }
  data: {
    password: string
  }
}

export interface IDeps {
  retrieveManyRepository: IRetrieveManyRepository
  retrieveRepository: IRetrieveRepository
  resetPasswordRepository: IResetPasswordRepository
  auditLogService: IAuditLogService
  passwordService: IPasswordService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Reset a user's password.
 *
 * Responsibilities:
 * - Validate that the reset link is valid and the user exists.
 * - Check if the record exists.
 * - Hash the new password securely.
 * - Transform and normalize the provided input.
 * - Update the user's password in the database.
 * - Create an audit log entry for this operation.
 * - Return a success response.
 */
export class ResetPasswordUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Validate that the reset link is valid and the user exists.
    const users = await this.deps.retrieveManyRepository.handle({
      filter: { 'request_password.code': input.filter.code },
    });
    if (users.data.length === 0) {
      return this.fail({ code: 400, message: 'Reset password code is invalid' });
    }

    // Check if the record exists.
    const retrieveResponse = await this.deps.retrieveRepository.raw(users.data[0]._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Hash the new password securely.
    const hashedPassword = await this.deps.passwordService.hash(input.data.password as string);

    // Transform and normalize the provided input.
    const userEntity = new UserEntity({
      password: hashedPassword,
      request_password: null,
    });

    // Reject update when no fields have changed.
    const changes = this.deps.auditLogService.buildChanges(
      retrieveResponse,
      this.deps.auditLogService.mergeDefined(retrieveResponse, userEntity.data),
      { redactFields },
    );
    if (changes.summary.fields?.length === 0) {
      return this.fail({ code: 400, message: 'No changes detected. Please modify at least one field before saving.' });
    }

    // Update the user's password in the database.
    const response = await this.deps.resetPasswordRepository.handle(users.data[0]._id, userEntity.data);

    // Create an audit log entry for this operation.
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: retrieveResponse._id!,
      entity_ref: retrieveResponse.username!,
      actor_type: 'anonymous',
      action: 'reset-password',
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

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
