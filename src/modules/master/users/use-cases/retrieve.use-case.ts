import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveRepository } from '../repositories/retrieve.repository';

export interface IInput {
  _id: string
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
}

export interface ISuccessData {
  _id: string
  name: string
  username: string
  email: string
  notes: string
  role: {
    _id: string
    code: string
    name: string
    permissions: string[]
  }
  is_archived: boolean
  created_at: Date
}

/**
 * Use case: Retrieve a single user's details.
 *
 * Responsibilities:
 * - Retrieve a single data record from the database.
 * - Return a success response.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Retrieve a single data record from the database.
    const response = await this.deps.retrieveRepository.handle(input._id);

    if (!response) return this.fail({
      code: 404,
      message: 'The requested data does not exist.',
    });

    // Return a success response.
    return this.success({
      _id: response._id,
      name: response.name,
      username: response.username,
      email: response.email,
      notes: response.notes,
      role: response.role,
      is_archived: response.is_archived,
      created_at: response.created_at,
    });
  }
}
