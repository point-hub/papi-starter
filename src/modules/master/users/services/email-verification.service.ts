import { tokenGenerate } from '@point-hub/express-utils';

import apiConfig from '@/config/api';

export interface IGenerateResponse {
  code: string
  url: string
}

export interface IEmailVerificationService {
  generate(isNewEmail?: boolean): IGenerateResponse;
}

export const generate = (isNewEmail = false) => {
  if (isNewEmail) {
    return {
      code: tokenGenerate(),
      url: `${apiConfig.clientUrl}/verify-new-email`,
    };
  }

  return {
    code: tokenGenerate(),
    url: `${apiConfig.clientUrl}/verify-email`,
  };
};


/**
 * Static email service (singleton)
 */
export const EmailVerificationService: IEmailVerificationService = {
  generate,
};
