import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';

import type { IAuthUser } from '../interface';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  authUser: IAuthUser
  filter: {
    _id: string
  }
  data: {
    current_password: string
    password: string
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  retrieveRepository: IRetrieveRepository
  uniqueValidationService: IUniqueValidationService
  passwordService: IPasswordService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update a user's password.
 *
 * Responsibilities:
 * - Check if user is exists.
 * - Verify current password using the password service.
 * - Hash the new password using the password service.
 * - Update the user password to the database.
 * - Return a success response.
 */
export class UpdatePasswordUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check if user is exists.
    const user = await this.deps.retrieveRepository.handle(input.filter._id);
    if (!user) {
      return this.fail({
        code: 400,
        message: 'User not found',
      });
    }

    // Verify current password using the password service.
    if (!(await this.deps.passwordService.verify(input.data.current_password, user.password!))) {
      return this.fail({
        code: 422,
        message: 'Invalid password',
        errors: {
          current_password: ['Invalid Password'],
        },
      });
    }

    // Hash the new password using the password service.
    const hashedPassword = await this.deps.passwordService.hash(input.data.password);

    // Update the user password to the database.
    const response = await this.deps.updateRepository.handle(input.filter._id, {
      password: hashedPassword,
      request_password: undefined,
    });

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
