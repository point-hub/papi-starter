import { BaseUseCase, type IQuery, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveOutput } from '../repositories/retrieve.repository';
import type { IRetrieveManyRepository } from '../repositories/retrieve-many.repository';

export interface IInput {
  query: IQuery
}

export interface IDeps {
  retrieveManyRepository: IRetrieveManyRepository
}

export interface ISuccessData {
  data: IRetrieveOutput[]
  pagination: {
    page: number
    page_count: number
    page_size: number
    total_document: number
  }
}

/**
 * Use case: Retrieve a paginated list of all users.
 *
 * Responsibilities:
 * - Retrieve user data.
 * - Return a success response.
 */
export class RetrieveManyUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Retrieve user data.
    const response = await this.deps.retrieveManyRepository.handle(input.query);

    // Return a success response.
    return this.success({
      data: response.data,
      pagination: response.pagination,
    });
  }
}
