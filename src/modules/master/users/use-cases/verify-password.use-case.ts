import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthUser } from '../interface';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IPasswordService } from '../services/password.service';

export interface IInput {
  authUser: IAuthUser
  data: {
    password: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  passwordService: Pick<IPasswordService, 'verify'>
}

/**
 * Use case: Authenticate a user during sign-in.
 *
 * Responsibilities:
 * - Retrieve the user record matching the provided identity.
 * - Reject if the user's email is not verified.
 * - Validate the provided password against the stored hash.
 * - Return boolean value of password is verified or not.
 */
export class VerifyPasswordUseCase extends BaseUseCase<IInput, IDeps, boolean> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<boolean> | IUseCaseOutputFailed> {
    // Retrieve the user record matching the provided identity.
    const users = await this.deps.identityMatcherRepository.handle(input.authUser.username!);

    // Reject authentication if no matching user is found.
    if (!users || users.data.length === 0) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // Validate the provided password against the stored hash.
    const user = users.data[0];
    const isPasswordVerified = await this.deps.passwordService.verify(input.data.password, user.password as string);
    if (!isPasswordVerified) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // Return boolean value of password is verified or not.
    return this.success(true);
  }
}
