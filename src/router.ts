import express, { type Express, type Request, type Response } from 'express'

import type { IBaseAppInput } from './app'
import healthRouter from './modules/health/router'
import masterExampleRouter from './modules/master/examples/router'
import transactionModuleExampleRouter from './modules/transaction/module-examples/router'
import { renderHbsTemplate } from './utils/email'

export default async function (baseRouterInput: IBaseAppInput) {
  const app: Express = express()

  /**
   * Register all available modules
   * <modules>/router.ts
   */
  app.use('/v1/health', await healthRouter(baseRouterInput))
  app.use('/v1/master/examples', await masterExampleRouter(baseRouterInput))
  app.use('/v1/transaction/module-examples', await transactionModuleExampleRouter(baseRouterInput))

  /**
   * Rendered email templates
   *
   * @example
   * Access this in your browser using the following path:
   * /templates/modules/examples/emails/example
   */
  app.get('/templates/*param', async (req: Request, res: Response) => {
    const params = Array.isArray(req.params['param']) ? req.params['param'].join('/') : req.params['param']
    const html = await renderHbsTemplate(`${params}.hbs`)
    res.send(html)
  })

  return app
}
