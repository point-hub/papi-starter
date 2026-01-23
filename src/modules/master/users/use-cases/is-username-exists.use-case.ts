import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIsUsernameExistsRepository } from '../repositories/is-username-exists.repository';

export interface IInput {
  username: string
}

export interface IDeps {
  isUsernameExistsRepository: IIsUsernameExistsRepository
}

export interface ISuccessData {
  exists: boolean
}

/**
 * Use case: Check if a username already exists.
 *
 * Responsibilities:
 * - Transform and normalize the provided username input.
 * - Check if the username exists in the database.
 * - Return a a success response containing the existence result.
 */
export class IsUsernameExistsUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Transform and normalize the provided username input.
    const userEntity = new UserEntity({ username: input.username });
    userEntity.trimmedUsername();

    // Check if the username exists in the database.
    const response = await this.deps.isUsernameExistsRepository.handle(userEntity.data.trimmed_username as string);

    // Return a a success response containing the existence result.
    return this.success({ exists: response });
  }
}
