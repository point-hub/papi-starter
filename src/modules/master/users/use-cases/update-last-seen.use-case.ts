import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUpdateLastSeenRepository } from '../repositories/update-last-seen.repository';

export interface IInput {
  filter: {
    _id?: string
  }
}

export interface IDeps {
  updateLastSeenRepository: IUpdateLastSeenRepository
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update last seen information.
 *
 * Responsibilities:
 * - Update last seen information to the database.
 * - Return a success response.
 */
export class UpdateLastSeenUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Update last seen information to the database.
    const response = await this.deps.updateLastSeenRepository.handle(input.filter._id as string);

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
