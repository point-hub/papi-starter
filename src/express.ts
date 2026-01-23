import 'express';

import type { IMakeControllerInput, IMakeMiddlewareInput } from '@point-hub/papi';
import type { NextFunction, Request, Response } from 'express';

import type { IAuthUser } from './modules/master/users/interface';

declare module 'express-serve-static-core' {
  interface Request {
    authUser: IAuthUser
  }
}

export const makeController = (makeControllerInput: IMakeControllerInput) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await makeControllerInput.controller({
        req,
        res,
        next,
        dbConnection: makeControllerInput.dbConnection,
      });
    } catch (error) {
      next(error);
    }
  };
};

export const makeMiddleware = (makeMiddlewareInput: IMakeMiddlewareInput) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await makeMiddlewareInput.middleware({
        req,
        res,
        next,
        dbConnection: makeMiddlewareInput.dbConnection,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
