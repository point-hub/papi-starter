import express, { Express } from 'express'

import { IBaseAppInput } from './app'
import exampleRouter from './modules/examples/router'

export default async function (baseRouterInput: IBaseAppInput) {
  const app: Express = express()

  /**
   * Register all available modules
   * <modules>/router.ts
   */
  app.use('/v1/examples', await exampleRouter(baseRouterInput))

  return app
}
