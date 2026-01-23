import { BaseErrorHandler, type TypeCodeStatus } from '@point-hub/papi';

export interface IOptions {
  message?: string
  errors?: object
}

export const throwApiError = (codeStatus: TypeCodeStatus, options?: IOptions) => {
  throw new BaseErrorHandler.ApiError(codeStatus, options);
};
