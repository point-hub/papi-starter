import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIsEmailExistsRepository } from '../repositories/is-email-exists.repository';

export interface IInput {
  email: string
}

export interface IDeps {
  isEmailExistsRepository: IIsEmailExistsRepository
}

export interface ISuccessData {
  exists: boolean
}

/**
 * Use case: Check if an email address already exists.
 *
 * Responsibilities:
 * - Transform and normalize the provided email input.
 * - Check if the email exists in the database.
 * - Return a success response containing the existence result.
 */
export class IsEmailExistsUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Transform and normalize the provided email input.
    const userEntity = new UserEntity({ email: input.email });
    userEntity.trimmedEmail();

    // Check if the email exists in the database.
    const response = await this.deps.isEmailExistsRepository.handle(userEntity.data.trimmed_email as string);

    // Return a success response containing the existence result.
    return this.success({ exists: response });
  }
}
