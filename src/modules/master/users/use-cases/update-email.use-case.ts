import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';

import { UserEntity } from '../entity';
import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  filter: {
    _id: string
  }
  data: {
    email?: string
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  uniqueValidationService: IUniqueValidationService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's email address.
 *
 * Responsibilities:
 * - Transform input data.
 * - Validate email uniqueness across all users.
 * - Save to the database
 * - Return a success response.
 */
export class UpdateEmailUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Transform input data.
    const userEntity = new UserEntity({
      email: input.data.email,
      email_verification: {},
    });
    userEntity.trimmedEmail();

    // Validate email uniqueness across all users.
    await this.deps.uniqueValidationService.validate(
      'users',
      {
        match: { trimmed_email: input.data.email },
        replaceErrorAttribute: { trimmed_email: 'email' },
      },
      {
        except: {
          _id: input.filter._id,
        },
      },
    );

    // Save to the database
    const response = await this.deps.updateRepository.handle(input.filter._id, userEntity.data);

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
