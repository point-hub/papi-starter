import express, { type Express, type Request, type Response } from 'express'

import type { IBaseAppInput } from './app'
import exampleRouter from './modules/examples/router'
import { renderHbsTemplate } from './utils/email'

export default async function (baseRouterInput: IBaseAppInput) {
  const app: Express = express()

  /**
   * Register all available modules
   * <modules>/router.ts
   */
  app.use('/v1/examples', await exampleRouter(baseRouterInput))

  /**
   * Rendered email templates
   *
   * @example
   * Access this in your browser using the following path:
   * /templates/modules/examples/emails/example
   */
  app.get('/templates/*', async (req: Request, res: Response) => {
    const html = await renderHbsTemplate(`${req.params[0]}.hbs`)
    res.send(html)
  })

  return app
}
