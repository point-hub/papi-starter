import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { ITokenService } from '../services/token.service';

export interface IInput {
  data: {
    token: string
  }
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  tokenService: ITokenService
}

export interface ISuccessData {
  _id: string
  email: string
  username: string
  name: string
}

/**
 * Use case: Verify a user's authentication token.
 *
 * Responsibilities:
 * - Verify the authenticity and validity of the provided token.
 * - Decode the token payload and extract the user identifier.
 * - Retrieve the corresponding user record from the repository.
 * - Return the verified user's information.
 */
export class VerifyTokenUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Verify the authenticity and validity of the provided token.
    const decodedToken = this.deps.tokenService.verifyToken(input.data.token);

    if (!decodedToken) {
      return this.fail({
        code: 401,
        message: 'Token verification failed',
      });
    }

    // Decode the token payload and extract the user identifier.
    const userId = decodedToken.sub as string;

    // Retrieve the corresponding user record from the repository.
    const response = await this.deps.retrieveRepository.handle(userId);

    // Return a failure response if the data does not exist.
    if (!response) return this.fail({
      code: 404,
      message: 'The requested data does not exist.',
    });

    // Return the verified user's information.
    return this.success({
      _id: response._id,
      username: response.username as string,
      email: response.email as string,
      name: response.name as string,
    });
  }
}
