import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IEmailService } from '@/modules/_shared/services/email.service';

import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { IEmailVerificationService } from '../services/email-verification.service';

export interface IInput {
  filter: {
    username: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  updateRepository: IUpdateRepository
  emailService: IEmailService
  emailVerificationService: IEmailVerificationService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Send an email verification link to the user.
 *
 * Responsibilities:
 * - Retrieve the user by email.
 * - Generate a new email verification link and code.
 * - Update the user's record with the verification data.
 * - Send an email containing the verification link and code.
 * - Return a success response.
 */
export class SendEmailVerificationUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Retrieve the user by email.
    const users = await this.deps.identityMatcherRepository.handle(input.filter.username);
    if (!users || users.data.length === 0) {
      return this.fail({ code: 422, message: 'Email is invalid', errors: { email: ['Email is invalid'] } });
    }

    // Generate a new email verification link and code.
    const linkEmailVerification = this.deps.emailVerificationService.generate();

    // Update the user's record with the verification data.
    const response = await this.deps.updateRepository.handle(users.data[0]._id, {
      email_verification: {
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
    });

    // Send an email containing the verification link and code.
    await this.deps.emailService.send(
      {
        to: users.data[0].email as string,
        subject: 'Please verify your email address',
        template: 'modules/master/users/emails/email-verification.hbs',
        context: {
          url: linkEmailVerification.url,
          code: linkEmailVerification.code,
        },
      },
    );

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
