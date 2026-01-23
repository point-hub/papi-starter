import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  authUser: IAuthUser
  filter: {
    _id: string
  }
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  authorizationService: IAuthorizationService
}

export interface ISuccessData {
  _id?: string
  operation_id?: string
  entity_type?: string
  entity_id?: string
  entity_ref?: string
  actor_type?: string
  actor_id?: string
  actor_name?: string
  actor?: IAuthUser
  action?: string
  module?: string
  system_reason?: string
  user_reason?: string
  changes?: {
    summary?: {
      fields?: string[]
      count?: number
    }
    snapshot?: {
      before?: object
      after?: object
    }
  }
  metadata?: {
    ip?: string
    device?: {
      type?: string
      model?: string
      vendor?: string
    }
    browser?: {
      type?: string
      name?: string
      version?: string
    }
    os?: {
      name?: string
      version?: string
    }
  }
  created_at?: Date
}

/**
 * Use case: Retrieve one.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Retrieve a single data record from the database.
 * - Return a success response.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'audit-logs:read');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Retrieve a single data record from the database.
    const response = await this.deps.retrieveRepository.handle(input.filter._id);
    if (!response) {
      return this.fail({
        code: 404,
        message: 'The requested data does not exist.',
      });
    }

    // Return a success response.
    return this.success({
      _id: response._id,
      operation_id: response.operation_id,
      entity_type: response.entity_type,
      entity_id: response.entity_id,
      entity_ref: response.entity_ref,
      actor_type: response.actor_type,
      actor_id: response.actor_id,
      actor_name: response.actor_name,
      actor: {
        _id: response.actor._id,
        username: response.actor.username,
        name: response.actor.name,
        email: response.actor.email,
      },
      action: response.action,
      module: response.module,
      system_reason: response.system_reason,
      user_reason: response.user_reason,
      changes: response.changes,
      metadata: response.metadata,
      created_at: response.created_at,
    });
  }
}
