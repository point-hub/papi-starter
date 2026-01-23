import { Router } from 'express';

import type { IBaseAppInput } from '@/app';
import { makeController, makeMiddleware } from '@/express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import type { IRoute } from '@/router';

import * as controller from './controllers/index';

const makeRouter = async ({ dbConnection }: IBaseAppInput) => {
  const router = Router();

  const routes: IRoute[] = [
    { method: 'post', path: '/', middlewares: [authMiddleware], controller: controller.createController },
    { method: 'get', path: '/', middlewares: [authMiddleware], controller: controller.retrieveManyController },
    { method: 'get', path: '/:id', middlewares: [authMiddleware], controller: controller.retrieveController },
    { method: 'patch', path: '/:id', middlewares: [authMiddleware], controller: controller.updateController },
    { method: 'delete', path: '/:id', middlewares: [authMiddleware], controller: controller.deleteController },
    { method: 'post', path: '/:id/archive', middlewares: [authMiddleware], controller: controller.archiveController },
    { method: 'post', path: '/:id/restore', middlewares: [authMiddleware], controller: controller.restoreController },
    { method: 'post', path: '/:id/update-email', middlewares: [authMiddleware], controller: controller.updateEmailController },
    { method: 'post', path: '/:id/update-password', middlewares: [authMiddleware], controller: controller.updatePasswordController },
  ];

  routes.forEach(({ method, path, controller, middlewares }) => {
    const middlewareFns = middlewares?.map((middleware) => makeMiddleware({ middleware, dbConnection })) ?? [];
    router[method](path, ...middlewareFns, makeController({ controller, dbConnection }));
  });

  return router;
};

export default makeRouter;
