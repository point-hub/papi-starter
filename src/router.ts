import type { IController, IMiddleware } from '@point-hub/papi';
import express, { type Express, type Request, type Response } from 'express';

import type { IBaseAppInput } from './app';
import { EmailService } from './modules/_shared/services/email.service';
import ablyRouter from './modules/ably/router';
import auditLogRouter from './modules/audit-logs/router';
import counterRouter from './modules/counters/router';
import healthRouter from './modules/health/router';
import masterExampleRouter from './modules/master/examples/router';
import masterPermissionRouter from './modules/master/permissions/router';
import masterRoleRouter from './modules/master/roles/router';
import masterUserRouter from './modules/master/users/router';
import authRouter from './modules/master/users/router-auth';

export interface IRoute {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete'
  path: string
  controller: IController
  middlewares?: IMiddleware[]
}

export default async function (baseRouterInput: IBaseAppInput) {
  const app: Express = express();

  /**
   * Register all available modules
   * <modules>/router.ts
   */
  app.use('/v1/ably', await ablyRouter(baseRouterInput));
  app.use('/v1/audit-logs', await auditLogRouter(baseRouterInput));
  app.use('/v1/auth', await authRouter(baseRouterInput));
  app.use('/v1/health', await healthRouter(baseRouterInput));
  app.use('/v1/counters', await counterRouter(baseRouterInput));
  app.use('/v1/master/users', await masterUserRouter(baseRouterInput));
  app.use('/v1/master/permissions', await masterPermissionRouter(baseRouterInput));
  app.use('/v1/master/roles', await masterRoleRouter(baseRouterInput));
  app.use('/v1/master/examples', await masterExampleRouter(baseRouterInput));

  /**
   * Rendered email templates
   *
   * @example
   * Access this in your browser using the following path:
   * /templates/modules/examples/emails/example
   */
  app.get('/templates/*param', async (req: Request, res: Response) => {
    const params = Array.isArray(req.params['param']) ? req.params['param'].join('/') : req.params['param'];
    const html = await EmailService.renderTemplate(`${params}.hbs`);
    res.send(html);
  });

  return app;
}
