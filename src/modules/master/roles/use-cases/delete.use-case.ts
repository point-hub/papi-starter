import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName } from '../entity';
import type { IDeleteRepository } from '../repositories/delete.repository';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  authUser: IAuthUser
  userAgent: IUserAgent
  ip: string
  filter: {
    _id: string
  }
  data: {
    delete_reason?: string
  }
}

export interface IDeps {
  deleteRepository: IDeleteRepository
  retrieveRepository: IRetrieveRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  authorizationService: IAuthorizationService
}

export interface ISuccessData {
  deleted_count: number
}

/**
 * Use case: Delete Role.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Check if the record exists
 * - Delete the data from the database.
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Return a success response.
 */
export class DeleteUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'roles:delete');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Check if the record exists
    const retrieveResponse = await this.deps.retrieveRepository.raw(input.filter._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Delete the data from the database.
    const response = await this.deps.deleteRepository.handle(input.filter._id);

    // Create an audit log entry for this operation.
    const changes = this.deps.auditLogService.buildChanges(retrieveResponse, {});
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: input.filter._id,
      entity_ref: `[${retrieveResponse.code}] ${retrieveResponse.name}`,
      actor_type: 'user',
      actor_id: input.authUser._id,
      actor_name: input.authUser.username,
      action: 'delete',
      module: 'role',
      system_reason: 'update data',
      user_reason: input.data?.delete_reason,
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
      type: 'roles',
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
      deleted_count: response.deleted_count,
    });
  }
}
