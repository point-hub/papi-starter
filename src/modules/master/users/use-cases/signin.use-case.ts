import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IPasswordService } from '../services/password.service';
import type { ITokenService } from '../services/token.service';

export interface IInput {
  data: {
    username: string
    password: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  passwordService: Pick<IPasswordService, 'verify'>
  tokenService: Pick<ITokenService, 'createAccessToken' | 'createRefreshToken'>
}

export interface ISuccessData {
  _id?: string
  email?: string
  username?: string
  name?: string
  role?: {
    _id: string
    code: string
    name: string
    permissions: string[]
  }
  avatar_url?: string
  access_token?: string
  refresh_token?: string
}

/**
 * Use case: Authenticate a user during sign-in.
 *
 * Responsibilities (with branching numbering):
 * - Normalize the provided identity (email or username).
 * - Retrieve the user record matching the provided identity.
 * - Validate the provided password against the stored hash.
 * - Reject authentication if the user's email is not verified.
 * - Generate access and refresh tokens for the authenticated user.
 * - Return the authenticated user's details and tokens.
 */
export class SigninUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Normalize the provided identity (email or username).
    let userInput: UserEntity;
    if (input.data.username.includes('@')) {
      userInput = new UserEntity({ email: input.data.username });
      userInput.trimmedEmail();
    } else {
      userInput = new UserEntity({ username: input.data.username });
      userInput.trimmedUsername();
    }

    // Retrieve the user record matching the provided identity.
    const users = await this.deps.identityMatcherRepository.handle(userInput.data.trimmed_username ?? (userInput.data.trimmed_email as string));
    if (!users || users.data.length === 0) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // Validate the provided password against the stored hash.
    const user = users.data[0];
    const isPasswordVerified = await this.deps.passwordService.verify(input.data.password, user.password as string);
    if (!isPasswordVerified) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // Reject authentication if the user's email is not verified.
    if (!user.email_verification || !user.email_verification.is_verified) {
      return this.fail({
        code: 422,
        message: 'Email not verified',
        errors: { username: ['Email associated with this account has not been verified'] },
      });
    }

    // Generate access and refresh tokens for the authenticated user.
    const accessToken = this.deps.tokenService.createAccessToken(user._id as string);
    const refreshToken = this.deps.tokenService.createRefreshToken(user._id as string);

    // Return the authenticated user's details and tokens.
    return this.success({
      _id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}
