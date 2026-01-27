import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';

import { collectionName, redactFields, UserEntity } from '../entity';
import type { IAuthUser } from '../interface';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  ip: string
  authUser: IAuthUser
  userAgent: IUserAgent
  filter: {
    _id: string
  }
  data: {
    current_password: string
    new_password: string
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  retrieveRepository: IRetrieveRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  uniqueValidationService: IUniqueValidationService
  passwordService: IPasswordService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's password.
 *
 * Responsibilities:
 * - Check if user is exists.
 * - Verify current password using the password service.
 * - Hash the new password using the password service.
 * - Update the user password to the database.
 * - Return a success response.
 */
export class UpdatePasswordUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check if user is exists.
    const user = await this.deps.retrieveRepository.handle(input.filter._id);
    if (!user) {
      return this.fail({
        code: 400,
        message: 'User not found',
      });
    }

    // Verify current password using the password service.
    if (!(await this.deps.passwordService.verify(input.data.current_password, user.password!))) {
      return this.fail({
        code: 422,
        message: 'Invalid password',
        errors: {
          current_password: ['Invalid Password'],
        },
      });
    }

    // Hash the new password using the password service.
    const hashedPassword = await this.deps.passwordService.hash(input.data.new_password);

    // Normalizes data (trim).
    const userEntity = new UserEntity({
      password: hashedPassword,
      request_password: undefined,
    });

    // Check if the record exists
    const retrieveResponse = await this.deps.retrieveRepository.raw(input.filter._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Reject update when no fields have changed
    const changes = this.deps.auditLogService.buildChanges(
      retrieveResponse,
      this.deps.auditLogService.mergeDefined(retrieveResponse, userEntity.data),
      { redactFields },
    );
    if (changes.summary.fields?.length === 0) {
      return this.fail({ code: 400, message: 'No changes detected. Please modify at least one field before saving.' });
    }

    // Update the user password to the database.
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
      action: 'update-password',
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

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
