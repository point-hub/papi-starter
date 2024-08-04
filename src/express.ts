import { IHttpRequest, IMakeControllerInput } from '@point-hub/papi'
import { NextFunction, Request, Response } from 'express'

export const makeController = async (makeControllerInput: IMakeControllerInput) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const httpRequest: IHttpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      cookies: req.cookies,
      signedCookies: req.signedCookies,
      headers: {
        Accept: req.get('Accept'),
        Authorization: req.get('Authorization'),
        'Content-Type': req.get('Content-Type'),
        'User-Agent': req.get('User-Agent'),
      },
    }

    try {
      const response = await makeControllerInput.controller({
        httpRequest,
        dbConnection: makeControllerInput.dbConnection,
      })
      res.status(response.status)
      if (response.cookies) {
        for (const cookie of response.cookies) {
          res.cookie(cookie.name, cookie.val, cookie.options)
        }
      }
      if (response.json) {
        res.json(response.json)
      }
    } catch (error) {
      next(error)
    }
  }
}
