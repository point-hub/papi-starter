import { BaseUseCase, type IQuery, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import type { IRetrieveManyRepository } from '../repositories/retrieve-many.repository';

export interface IInput {
  authUser: IAuthUser
  query: IQuery
}

export interface IDeps {
  retrieveManyRepository: IRetrieveManyRepository
  authorizationService: IAuthorizationService
}

export interface ISuccessData {
  data: {
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
  }[]
  pagination: {
    page: number
    page_count: number
    page_size: number
    total_document: number
  }
}

/**
 * Use case: Retrieve all.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Retrieve all data from the database.
 * - Optionally filter response fields using `query.fields`.
 * - Return a success response.
 */
export class RetrieveManyUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'audit-logs:read');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Retrieve all data from the database.
    const response = await this.deps.retrieveManyRepository.handle(input.query);

    // Optionally filter response fields using `query.fields`.
    const fields = typeof input.query.fields === 'string'
      ? input.query.fields.split(',').map(f => f.trim())
      : null;

    // Return a success response.
    return this.success({
      data: response.data.map(item => {
        const mapped = {
          _id: item._id,
          operation_id: item.operation_id,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          entity_ref: item.entity_ref,
          actor_type: item.actor_type,
          actor_id: item.actor_id,
          actor_name: item.actor_name,
          action: item.action,
          module: item.module,
          system_reason: item.system_reason,
          user_reason: item.user_reason,
          changes: item.changes,
          metadata: item.metadata,
          created_at: item.created_at,
        };

        // If no fields requested → return full object
        if (!fields) return mapped;

        // Otherwise → return only requested fields
        return Object.fromEntries(
          Object.entries(mapped).filter(([key]) => fields.includes(key)),
        );
      }),
      pagination: response.pagination,
    });
  }
}
