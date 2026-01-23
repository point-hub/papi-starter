import { tokenGenerate } from '@point-hub/express-utils';

import apiConfig from '@/config/api';

export interface IGenerateResponse {
  code: string
  url: string
}

export interface IResetPasswordService {
  generate(): IGenerateResponse;
}

export const generate = () => {
  return {
    code: tokenGenerate(),
    url: `${apiConfig.clientUrl}/reset-password`,
  };
};

/**
 * Static email service (singleton)
 */
export const ResetPasswordService: IResetPasswordService = {
  generate,
};
