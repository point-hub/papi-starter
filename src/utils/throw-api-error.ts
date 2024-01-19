import { BaseErrorHandler, type TypeCodeStatus } from '@point-hub/papi'

export const throwApiError = (codeStatus: TypeCodeStatus, errors?: object) => {
  throw new BaseErrorHandler.ApiError(codeStatus, errors)
}
