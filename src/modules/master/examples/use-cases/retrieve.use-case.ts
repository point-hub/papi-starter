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
  _id: string
  code: string
  name: string
  age?: number
  gender?: string
  notes?: string
  composite_unique_1: string
  composite_unique_2: string
  optional_unique?: string
  optional_composite_unique_1?: string
  optional_composite_unique_2?: string
  xxx_composite_unique_1?: string
  xxx_composite_unique_2?: string
  is_archived: boolean
  created_at: Date
  created_by: IAuthUser
}

/**
 * Use case: Retrieve Example.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Retrieve a single data record from the database.
 * - Return a success response.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'examples:read');
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
      code: response.code,
      name: response.name,
      age: response.age,
      gender: response.gender,
      notes: response.notes,
      composite_unique_1: response.composite_unique_1,
      composite_unique_2: response.composite_unique_2,
      optional_unique: response.optional_unique,
      optional_composite_unique_1: response.optional_composite_unique_1,
      optional_composite_unique_2: response.optional_composite_unique_2,
      xxx_composite_unique_1: response.xxx_composite_unique_1,
      xxx_composite_unique_2: response.xxx_composite_unique_2,
      is_archived: response.is_archived,
      created_at: response.created_at,
      created_by: {
        _id: response.created_by?._id,
        username: response.created_by?.username,
        name: response.created_by?.name,
        email: response.created_by?.email,
      },
    });
  }
}
