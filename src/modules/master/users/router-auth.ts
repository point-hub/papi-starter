import { Router } from 'express';

import type { IBaseAppInput } from '@/app';
import { makeController, makeMiddleware } from '@/express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { refreshMiddleware } from '@/middlewares/refresh.middleware';
import type { IRoute } from '@/router';

import * as controller from './controllers/index';

const makeRouter = async ({ dbConnection }: IBaseAppInput) => {
  const router = Router();

  const routes: IRoute[] = [
    { method: 'post', path: '/signup', controller: controller.signupController },
    { method: 'post', path: '/signin', controller: controller.signinController },
    { method: 'get', path: '/me', middlewares: [authMiddleware], controller: controller.meController },
    { method: 'post', path: '/refresh', middlewares: [refreshMiddleware], controller: controller.refreshController },
    { method: 'post', path: '/signout', controller: controller.signoutController },
    { method: 'post', path: '/update-last-seen', middlewares: [authMiddleware], controller: controller.updateLastSeenController },
    { method: 'post', path: '/verify-password', middlewares: [authMiddleware], controller: controller.verifyPasswordController },
    { method: 'post', path: '/verify-email', controller: controller.verifyEmailController },
    { method: 'post', path: '/verify-new-email', controller: controller.verifyNewEmailController },
    { method: 'post', path: '/verify-token', controller: controller.verifyTokenController },
    { method: 'post', path: '/request-password', controller: controller.requestPasswordController },
    { method: 'post', path: '/reset-password', controller: controller.resetPasswordController },
    { method: 'post', path: '/is-email-exists', controller: controller.isEmailExistsController },
    { method: 'post', path: '/send-email-verification', controller: controller.sendEmailVerificationController },
  ];

  routes.forEach(({ method, path, controller, middlewares }) => {
    const middlewareFns = middlewares?.map((middleware) => makeMiddleware({ middleware, dbConnection })) ?? [];
    router[method](path, ...middlewareFns, makeController({ controller, dbConnection }));
  });

  return router;
};

export default makeRouter;
