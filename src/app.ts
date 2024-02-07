import type { IBaseRouterInput } from '@point-hub/papi'
import { BaseErrorHandler } from '@point-hub/papi'
import { Server } from 'bun'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { RedisClientType } from 'redis'

import cookieConfig from '@/config/cookie'
import corsConfig from '@/config/cors'

import router from './router'

export interface IBaseAppInput extends IBaseRouterInput {
  webSocketServer?: Server
  publisher?: RedisClientType
}

export const createApp = async (appInput: IBaseAppInput) => {
  const app = express()

  /**
   * Get Client IP
   *
   * 1. Edit nginx header like this "proxy_set_header X-Forwarded-For $remote_addr;"
   * 2. Enable trust proxy on express app "app.set('trust proxy', true)"
   * 3. Use "req.ip" to get Client IP
   *
   * Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
   * see https://expressjs.com/en/guide/behind-proxies.html
   */
  app.set('trust proxy', true)
  // Gzip compressing can greatly decrease the size of the response body
  app.use(compression())
  // Parse json request body
  app.use(express.json())
  // Parse urlencoded request body
  app.use(express.urlencoded({ extended: true }))
  // Set security HTTP headers
  app.use(helmet())
  // Parse cookie
  app.use(cookieParser(cookieConfig.secret))
  // Cors
  app.use(
    cors({
      origin: corsConfig.origin,
      credentials: corsConfig.credentials,
    }),
  )

  /**
   * Static Assets
   *
   * All files must be placed in the src/assets folder, to be publicly accessible in the /assets path.
   */
  app.use('/assets', express.static('src/assets'))

  /**
   * API Routes
   *
   * Here is where you can register API routes for your application.
   */
  app.use('/', await router(appInput))

  app.use(BaseErrorHandler.invalidPathMiddleware)

  app.use(BaseErrorHandler.mongodbErrorHandlerMiddleware())

  app.use(BaseErrorHandler.errorHandlerMiddleware)

  return app
}
