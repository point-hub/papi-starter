import type { IMiddleware, IMiddlewareInput } from '@point-hub/papi';

import { throwApiError } from '@/modules/_shared/utils/throw-api-error';
import { RetrieveRepository } from '@/modules/master/users/repositories/retrieve.repository';
import { TokenService } from '@/modules/master/users/services/token.service';

export const authMiddleware: IMiddleware = async (middlewareInput: IMiddlewareInput) => {
  const bearer = middlewareInput.req['headers']['authorization'];
  const signedCookie = middlewareInput.req['cookies']['papp_starter_access'];

  const token = bearer && bearer.startsWith('Bearer ') ? bearer.split(' ')[1] : signedCookie;
  if (!token) { return throwApiError(401); }

  const decoded = TokenService.verifyToken(token);
  if (!decoded) { return throwApiError(401); }

  const retrieveRepository = new RetrieveRepository(middlewareInput.dbConnection);
  const user = await retrieveRepository.handle((decoded as { sub: string }).sub);
  if (!user) { return throwApiError(401); }

  middlewareInput.req['authUser'] = {
    _id: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };
};
